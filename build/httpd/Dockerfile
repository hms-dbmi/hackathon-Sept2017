FROM httpd:2.4.27-alpine

RUN apk add --update openssl sed

# Replace virtual host config file with ours
# hackathon specific
COPY httpd-vhosts.conf ${HTTPD_PREFIX}/conf/extra/httpd-vhosts.conf

# Enable virtual hosting config file
RUN sed -i '/^#Include conf.extra.httpd-vhosts.conf/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf

# Enable necessary proxy modules
RUN sed -i '/^#LoadModule proxy_module/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf
RUN sed -i  '/^#LoadModule proxy_http_module/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf
RUN sed -i '/^#LoadModule proxy_connect_module/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf

#### SSL ####
# enable ssl
#RUN sed -i '/^#Include conf/extra/httpd-ssl.conf/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf
RUN sed -i '/^#LoadModule ssl_module modules\/mod_ssl.so/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf
RUN sed -i '/^#LoadModule rewrite_module modules\/mod_rewrite.so/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf
RUN sed -i '/^#LoadModule socache_shmcb_module modules\/mod_socache_shmcb.so/s/^#//' ${HTTPD_PREFIX}/conf/httpd.conf
RUN mkdir /usr/local/apache2/logs/ssl_mutex

ENV CERT_DIR $HTTPD_PREFIX/conf
COPY certs/ $CERT_DIR/

ENV APP_KEY $CERT_DIR/server.key
ENV APP_CERT $CERT_DIR/server.crt
ENV APP_CA $CERT_DIR/server-ca.crt
ENV APPLICATION_NAME default

# hackathon specific
ENV NHANES_IRCT nhanes_irct
ENV SSC_IRCT ssc_irct

# generate self-signed certificate (if they don't exist)
COPY scripts/gencerts.sh /docker-entrypoint
RUN chmod +x /docker-entrypoint


# This line would eventually map a host path to the
# apache document root in the container, but for now we
# hack it because I'm on docker machine and I don't want
# to have to scp my files.
VOLUME ["${HTTPD_PREFIX}/htdocs"]

# This is a hack to get my app files into the container
#COPY app ${HTTPD_PREFIX}/htdocs

ENTRYPOINT ["/docker-entrypoint"]
CMD ["httpd-foreground"]
