# AKS Superapp
In this repo, you will learn about some of the various AKS features that make it easier for developers to deploy that code without having to worry too much about infrastructure.

There are preview features being used including OIDC issuer, [workload identity](https://learn.microsoft.com/en-us/azure/aks/workload-identity-deploy-cluster#register-the-enableworkloadidentitypreview-feature-flag) and cni overlay. You will need to ensure these features are enabled in your subscription before proceeding with the deployment.

### Optional note (ignore this during workshop):
You can also use AKSC UI to make this deployment by clicking on [this link](https://azure.github.io/AKS-Construction/?net.networkPluginMode=true&net.vnetAksSubnetAddressPrefix=10.240.0.0%2F24&net.podCidr=10.244.0.0%2F16&addons.ingress=nginx&deploy.deployItemKey=deployArmCli&addons.workloadIdentity=true), but in this case because of the level of customization required and for easy automation, we will be using AKSC's underlying Bicep code. The differences between the deployment made by the link above and this customization we will be using are as follows:
* CSI driver for keyvault addon will be enabled in your cluster using the automation script. You will have to enable that addon yourself using CLI command after creating the cluster if you use the UI option. 
* We wil be creating a keyvault using custom bicep code and we will also be creating a secret in the deployed keyvault (see kvRbac.bicep)
* The workload identity addon will not be deployed by using the managed addon, we are using helm charts to install them instead (check workloadId.bicep)

## Deployment
To begin, clone AKSC repo.

```bash
cd IaC
git clone https://github.com/Azure/AKS-Construction
```

Get the signed in user id so that you can get admin access to the clusteryou create
```bash
SIGNEDINUSER=$(az ad signed-in-user show --query id --out tsv)
RGNAME=superapp
```

Create deployment
```bash
az group create -n $RGNAME -l EastUs
DEP=$(az deployment group create -g $RGNAME  --parameters signedinuser=$SIGNEDINUSER  -f main.bicep -o json)
```

Get required variables
```bash
KVNAME=$(echo $DEP | jq -r '.properties.outputs.kvAppName.value')
OIDCISSUERURL=$(echo $DEP | jq -r '.properties.outputs.aksOidcIssuerUrl.value')
AKSCLUSTER=$(echo $DEP | jq -r '.properties.outputs.aksClusterName.value')
SUPERAPPID=$(echo $DEP | jq -r '.properties.outputs.idsuperappClientId.value')
TENANTID=$(az account show --query tenantId -o tsv)
ACRNAME=$(az acr list -g $RGNAME --query [0].name  -o tsv)
```

Log into AKS and deploy NGINX ingress. Since we are using 
```bash
az aks get-credentials -n $AKSCLUSTER -g $RGNAME --overwrite-existing
kubectl get nodes

curl -sL https://github.com/Azure/AKS-Construction/releases/download/0.9.6/postdeploy.sh  | bash -s -- -r https://github.com/Azure/AKS-Construction/releases/download/0.9.6 \
	-p ingress=nginx
```

cd out of IaC folder
```bash
cd ..
```

## Building the images
We will build images from source code and pull database images from dockerhub. WE will store these images in our container registry to stay in compliance with our policy to only use images in approved registry

Build front end image
```bash
cd fib-calculator/client
az acr build -t client:v1 -r $ACRNAME --resource-group $RGNAME .
```

Build api image
```bash
cd ../server
az acr build -t server:v1 -r $ACRNAME --resource-group $RGNAME .
```

Build fib calculator image
```bash
cd ../worker
az acr build -t worker:v1 -r $ACRNAME --resource-group $RGNAME .
```
Import redis and postgres images from dockerhub
```bash
az acr import --name $ACRNAME --source docker.io/library/redis:latest --resource-group $RGNAME
az acr import --name $ACRNAME  --source docker.io/library/postgres:latest --resource-group $RGNAME
```

Verify that the 5 required images are in the container registry
```bash
az acr repository list --name $ACRNAME --resource-group $RGNAME
```

### Deploy required resources

Change the change the deployment files to use the proper container registry names using sed commands. Please note, if you are using a mac you will need to change the command to `sed -i '' "s/<ACR name>/$ACRNAME/" client-deployment.yaml`. If this doesnt work, you willneed to update the files manually.
```bash
cd ../k8s
sed -i  "s/<ACR name>/$ACRNAME/" client-deployment.yaml
sed -i  "s/<ACR name>/$ACRNAME/" postgres-deployment.yaml
sed -i  "s/<ACR name>/$ACRNAME/" redis-deployment.yaml
sed -i  "s/<ACR name>/$ACRNAME/" server-deployment.yaml
sed -i  "s/<ACR name>/$ACRNAME/" worker-deployment.yaml
```
Update the secret provider class file
```bash
sed -i  "s/<identity clientID>/$SUPERAPPID/" postgres-secret-provider-class.yaml
sed -i  "s/<kv name>/$KVNAME/" postgres-secret-provider-class.yaml
sed -i  "s/<tenant ID>/$TENANTID/" postgres-secret-provider-class.yaml
```

Update the service account files. These service accounts are using workload identity federated identity.
```bash
sed -i  "s/<identity clientID>/$SUPERAPPID/" svc-accounts.yaml
sed -i  "s/<tenant ID>/$TENANTID/" svc-accounts.yaml
```

```bash
kubectl create namespace superapp 
kubectl apply -f .
```
Note: Depending on the order in which the manifest files are deployed, some pods may not connect and so you might have to redeploy by deleting the deployment and reapplying.

So what have we done here? We are using workload identities. But how was the workload identity deployed? Check the resources towards the end of the main.bicep file in the IaC folder as well as the workloadid.bicep file. The kvrbac.bicep file shows how the workload identity was granted access to keyvault to pull secrets as well as how the postgres password was created.

## Scalability testing
We tested the app using a single user accessing it using the website. But how do we ensure our application will hold when there are hundreds or thousands of users using it at once? We will use Azure load testing (preview) using a jmeter test script to test this. We will see if our cluster scales and learn how easy it is to enable scaling. 

