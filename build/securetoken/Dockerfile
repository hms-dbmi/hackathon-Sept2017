FROM java:8-jdk-alpine
MAINTAINER Andre Rosa <andre_rosa@hms.harvard.edu>

EXPOSE 8080

# token service jar
COPY target/ /opt/wildfly-swarm/

ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-jar", "/opt/wildfly-swarm/securetoken.jar"]
