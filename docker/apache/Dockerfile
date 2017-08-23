FROM httpd:2.4.27-alpine

# Replace virtual host config file with ours
COPY httpd-vhosts.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf

# Enable virtual hosting config file
RUN ["sed", "-i", "/^#Include conf.extra.httpd-vhosts.conf/s/^#//", "/usr/local/apache2/conf/httpd.conf"]

# Enable necessary proxy modules
RUN ["sed", "-i", "/^#LoadModule proxy_module/s/^#//", "/usr/local/apache2/conf/httpd.conf"]
RUN ["sed", "-i", "/^#LoadModule proxy_http_module/s/^#//", "/usr/local/apache2/conf/httpd.conf"]
RUN ["sed", "-i", "/^#LoadModule proxy_connect_module/s/^#//", "/usr/local/apache2/conf/httpd.conf"]

# This line would eventually map a host path to the 
# apache document root in the container, but for now we
# hack it because I'm on docker machine and I don't want
# to have to scp my files.
#VOLUME ["/usr/local/apache2/htdocs"]

# This is a hack to get my app files into the container
COPY app /usr/local/apache2/htdocs

