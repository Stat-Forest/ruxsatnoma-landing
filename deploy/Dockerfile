# deploy/Dockerfile
# Runtime-only image: the bundle is built on the CI runner and arrives as dist/.
# The build context is the repository root (see docker-compose.deploy.yml).
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
