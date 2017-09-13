Biomedical Data Visualization and User Interfaces using the PIC-SURE API as a backend service:

A combined datathon/hackathon brought to you by DFCI, HMS DBMI and BCH CHIP

Thursday Sept 14th and Sept 15th 2017 at DBMI 3rd, 4th and 5th floor Starts Thursday Sept 14th 9AM Lahey Room Countway 5th floor

Contestants are challenged with providing a user interface data exploration tool fed by PIC-SURE queries. Any data manipulations must be performed either inside the web browser or through the new PIC-SURE Scripted Query functionality (JS and possibly Python or R). Each team should contain at least one scientist (PostDoc, PhD student, etc.) and at least two developers.

# Docker Image Compatible versions

```
httpd_version=hackathon
securetoken_version=hackathon
irct_version=2496.hackathon
irct_init_version=0.4.0
```

## Before Deploying

Make sure you are logged into the DTR (<https://dtr.avl.dbmi.hms.harvard.edu>)

```
docker login dtr.avl.dbmi.hms.harvard.edu
```

## Run Datadog

If you would like to monitor the IRCT stacks in DataDog, run the following commands:

```
cd datadog/
docker-compose up -d
```

## Deploying the IRCT stack (development)

To independently test the stack outside from one of our production environments, the following configuration is required:

### Environment File (.env)

Populate the following projects/nhanes/.env variables (IGNORE THAT IT READS NHANES -- I just always test with NHANES. Can be any i2b2transmart stack you have access to its secrets):

```
# irct stack
APPLICATION_NAME=
NHANES_IRCT=stack_test
NHANES_BEARER_TOKEN=


# nhanes irct
IRCTMYSQLADDRESS=mysql
IRCT_DB_PORT=3306
IRCT_DB_CONNECTION_USER=root
IRCTMYSQLPASS=password

I2B2TRANSMART_URL=
IRCT_RESOURCE_NAME=
```

### Populate the file projects/nhanes/properties/prop.yml with the Auth0 client secret

`client_secret:`

### Run the following docker-compose commands

```
cd projects/
docker-compose up -d
cd nhanes/
#Ensure that you have shared the containing dir in your Docker Engine (locally)
docker-compose -f dev.yml up -d irct securetoken
(wait 60 secs)
docker-compose -f dev.yml up -d irct-init
docker-compose -f dev.yml restart irct
```

### Run query

```
https://<docker host>/NHANES/rest/
```

## Deploying the NHANES & SSC IRCT stack (hackathon production)

The i2b2transmart instance you are running this IRCT stack against _must_ have the IRCT secure token service running and available. You must add the additional variables `IRCT_SECURITY_SERVICE` to each IRCT stack's .env file

### Environment File (.env)

```
irct_version=2496.hackathon
irct_init_version=0.4.0

# irct stack
APPLICATION_NAME=nhanes-prod
NHANES_IRCT=nhanes-prod
NHANES_BEARER_TOKEN=


# nhanes irct
IRCTMYSQLADDRESS=mysql
IRCT_DB_PORT=3306
IRCT_DB_CONNECTION_USER=root
IRCTMYSQLPASS=nhanes-pass
I2B2TRANSMART_URL=https://nhanes.hms.harvard.edu


IRCT_RESOURCE_NAME=nhanes
IRCT_SECURITY_SERVICE=https://nhanes.hms.harvard.edu/irct-security-service/token/validate

# irct sci db support
SCIDB_HOST=https://ec2-54-209-207-47.compute-1.amazonaws.com:8083
SCIDB_USER=
SCIDB_PASSWORD=
```

### Run the following docker-compose commands

```
# loads up networks, httpd
cd projects/
docker-compose up -d

# starts up irct stack
cd nhanes/
docker-compose up -d irct
(wait 60 secs)
# initializes irct stack
docker-compose up -d irct-init

docker-compose restart irct

# do the same for the ssc irct stack
cd ../ssc/
docker-compose up -d irct
(wait 60 secs)
docker-compose up -d irct-init
docker-compose restart irct
```
