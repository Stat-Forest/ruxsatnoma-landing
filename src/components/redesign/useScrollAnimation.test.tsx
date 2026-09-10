import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollAnimation } from './useScrollAnimation';

describe('useScrollAnimation', () => {
  let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
  let observeMock: ReturnType<typeof vi.fn>;
  let unobserveMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();

    class MockIntersectionObserver {
      constructor(callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
        observerCallback = callback;
      }
      observe = observeMock;
      unobserve = unobserveMock;
      disconnect = disconnectMock;
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('initializes with isVisible false and returns a ref', () => {
    const { result } = renderHook(() => useScrollAnimation());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.isInView).toBe(false);
    expect(result.current[1]).toBe(false);
    expect(result.current.ref).toBeDefined();
    expect(result.current[0]).toBe(result.current.ref);
  });

  it('supports both array and object destructuring', () => {
    const { result } = renderHook(() => useScrollAnimation());
    const [arrRef, arrVisible] = result.current;
    const { ref: objRef, isVisible: objVisible, isInView: objInView } = result.current;

    expect(arrRef).toBe(objRef);
    expect(arrVisible).toBe(objVisible);
    expect(objInView).toBe(objVisible);
  });

  it('accepts options object or numeric threshold', () => {
    const targetEl = document.createElement('div');

    const { rerender } = renderHook(() => {
      const hookRes = useScrollAnimation({ threshold: 0.5, rootMargin: '10px' });
      (hookRes.ref as { current: HTMLDivElement | null }).current = targetEl;
      return hookRes;
    });

    rerender();
    expect(observeMock).toHaveBeenCalledWith(targetEl);
  });

  it('becomes visible when intersecting and disconnects if once=true', () => {
    const targetEl = document.createElement('div');

    const { result, rerender } = renderHook(() => {
      const hookRes = useScrollAnimation({ once: true });
      (hookRes.ref as { current: HTMLDivElement | null }).current = targetEl;
      return hookRes;
    });

    // Re-render so useEffect sees ref.current
    rerender();

    expect(observeMock).toHaveBeenCalledWith(targetEl);

    // Simulate entering view
    act(() => {
      observerCallback([{ isIntersecting: true, target: targetEl }]);
    });

    expect(result.current.isVisible).toBe(true);
    expect(unobserveMock).toHaveBeenCalledWith(targetEl);
  });

  it('toggles visibility when once=false', () => {
    const targetEl = document.createElement('div');

    const { result, rerender } = renderHook(() => {
      const hookRes = useScrollAnimation({ once: false });
      (hookRes.ref as { current: HTMLDivElement | null }).current = targetEl;
      return hookRes;
    });

    rerender();

    // Enter view
    act(() => {
      observerCallback([{ isIntersecting: true, target: targetEl }]);
    });
    expect(result.current.isVisible).toBe(true);

    // Leave view
    act(() => {
      observerCallback([{ isIntersecting: false, target: targetEl }]);
    });
    expect(result.current.isVisible).toBe(false);
  });

  it('disconnects on unmount', () => {
    const targetEl = document.createElement('div');

    const { unmount, rerender } = renderHook(() => {
      const hookRes = useScrollAnimation();
      (hookRes.ref as { current: HTMLDivElement | null }).current = targetEl;
      return hookRes;
    });

    rerender();
    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });
});
