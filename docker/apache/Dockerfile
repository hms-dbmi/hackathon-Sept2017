FROM httpd:2.4.27-alpine

COPY httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

RUN ["sed", "-i", "/^#Include conf.extra.httpd-vhosts.conf/s/^#//", "/usr/local/apache2/conf/httpd.conf"]
RUN ["sed", "-i", "/^#LoadModule proxy_module/s/^#//", "/usr/local/apache2/conf/httpd.conf"]
RUN ["sed", "-i", "/^#LoadModule proxy_http_module/s/^#//", "/usr/local/apache2/conf/httpd.conf"]
RUN ["sed", "-i", "/^#LoadModule proxy_connect_module/s/^#//", "/usr/local/apache2/conf/httpd.conf"]

 