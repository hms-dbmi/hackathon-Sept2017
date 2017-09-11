Biomedical Data Visualization and User Interfaces using the PIC-SURE API as a backend service:

A combined datathon/hackathon brought to you by DFCI, HMS DBMI and BCH CHIP

Thursday Sept 14th and Sept 15th 2017 at DBMI 3rd, 4th and 5th floor
Starts Thursday Sept 14th 9AM 
Lahey Room Countway 5th floor

Contestants are challenged with providing a user interface data exploration tool fed by PIC-SURE queries. Any data manipulations must be performed either inside the web browser or through the new PIC-SURE Scripted Query functionality (JS and possibly Python or R). Each team should contain at least one scientist (PostDoc, PhD student, etc.) and at least two developers.

# Docker Image Compatible versions
````
httpd_version=hackathon
securetoken_version=hackathon
irct_version=2479.hackathon
irct_init_version=0.3.0
````

## Deploying the IRCT stack (development)

To independently test the stack outside from one of our production environments, the following configuration is required:

### Environment File (.env)

Populate the following .env variables (IGNORE THAT IT READS NHANES -- I just always test with NHANES. Can be any i2b2transmart stack you have access to its secrets):
```
# irct stack name
NHANES_IRCT=irct_stack

# irct
NHANES_IRCTMYSQLADDRESS=mysql
NHANES_IRCT_DB_PORT=3306
NHANES_IRCT_DB_CONNECTION_USER=root
NHANES_IRCTMYSQLPASS=mysqlpass
NHANES_AUTH0_DOMAIN=avillachlab.auth0.com


# i2b2 url
NHANES_I2B2TRANSMART_URL=
NHANES_APPLICATION_NAME=
NHANES_IRCT_RESOURCE_NAME=
NHANES_AUTH0_CLIENT_ID=
NHANES_AUTH0_CLIENT_SECRET=
NHANES_BEARER_TOKEN=
```

### Populate the file properties/propnh.yml with the Auth0 client secret
`client_secret:`

### Run the following docker-compose commands
```
docker-compose up -d
docker-compose -f debug.yml up -d irct securetoken
(wait 60 secs)
docker-compose -f debug.yml up -d irct-init
docker-compose -f debug.yml restart irct
```

### Run query
```
https://<docker host>/NHANES/rest/
```


## Deploying the NHANES & SSC IRCT stack (hackathon production)

The i2b2transmart instance you are running this IRCT stack against *must* have the IRCT secure token service running and available. You must add the additional variables
`NHANES_IRCT_SECURITY_SERVICE` and `SSC_IRCT_SECURITY_SERVICE`

### Environment File (.env)
```
httpd_version=hackathon
securetoken_version=hackathon
irct_version=2479.hackathon
irct_init_version=0.3.0

# irct stacks
NHANES_IRCT=nhanes_irct
SSC_IRCT=ssc_irct

# nhanes irct
NHANES_IRCTMYSQLADDRESS=mysql
NHANES_IRCT_DB_PORT=3306
NHANES_IRCT_DB_CONNECTION_USER=root
NHANES_IRCTMYSQLPASS=mysqlpass
NHANES_AUTH0_DOMAIN=avillachlab.auth0.com
NHANES_I2B2TRANSMART_URL=https://nhanes.hms.harvard.edu
NHANES_IRCT_SECURITY_SERVICE=https://nhanes.hms.harvard.edu/irct-security-service/token/validate

NHANES_APPLICATION_NAME=nhanes-prod
NHANES_IRCT_RESOURCE_NAME=nhanes
NHANES_AUTH0_CLIENT_ID=
NHANES_AUTH0_CLIENT_SECRET=
NHANES_BEARER_TOKEN=


# ssc irct
SSC_IRCTMYSQLADDRESS=mysql
SSC_IRCT_DB_PORT=3306
SSC_IRCT_DB_CONNECTION_USER=root
SSC_IRCTMYSQLPASS=mysqlpass
SSC_AUTH0_DOMAIN=avillachlab.auth0.com
SSC_I2B2TRANSMART_URL=https://ssc.hms.harvard.edu
SSC_IRCT_SECURITY_SERVICE=https://ssc.hms.harvard.edu/irct-security-service/token/validate

SSC_APPLICATION_NAME=ssc-prod
SSC_IRCT_RESOURCE_NAME=ssc-prod
SSC_AUTH0_CLIENT_ID=
SSC_AUTH0_CLIENT_SECRET=
SSC_BEARER_TOKEN=
```

### Run the following docker-compose commands
```
# loads up networks, httpd
docker-compose up -d

# starts up irct stack
docker-compose -f nhanes.yml up -d irct
(wait 60 secs)
# initializes irct stack
docker-compose -f nhanes.yml up -d irct-init

docker-compose -f nhanes.yml restart irct

# do the same for the ssc irct stack
docker-compose up -d
docker-compose -f ssc.yml up -d irct
(wait 60 secs)
docker-compose -f ssc.yml up -d irct-init
docker-compose -f ssc.yml restart irct
```
