# Prerequisites
It is assumed you have basic knowledge of Containers, Kubernetes and Azure. You would also require Contributor and User Access Admin access to an Azure subscription and an AAD tenant where you have User Admin access. On your computer you will need to have the following installed
* Git
* [Bicep](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/install)
* [jq](https://stedolan.github.io/jq/download/)
* [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/)
* [sed](https://gnuwin32.sourceforge.net/packages/sed.htm) (optional)
* [node and npm](https://nodejs.org/en/download/) for the Bridge to Kubernetes step
* Azure CLI
* [Kubelogin](https://github.com/Azure/kubelogin/releases/download/v0.0.26/kubelogin-linux-amd64.zip)

Docker desktop would be required for some optional steps. All commands are designed to run on bash terminals.
You will also require visual studio code with the following extensions installed for some **optional** steps: 
* Azure Kubernetes Service
* Azure tools
* Bridge to Kubernetes
* Developer Tools for Azure Kubernetes Service. 

You can install these by searching for them in the Extensions tab.

> :bulb: If you have access to [GitHub Codespaces](https://docs.github.com/en/codespaces/overview) or [Docker Desktop](https://www.docker.com/products/docker-desktop/) on your local machine, it is highly recommended that you deploy this using a [devcontainer](https://code.visualstudio.com/docs/devcontainers/containers) as it includes all the tools you need. The configuration for the devcontainer can be found [here](./.devcontainer).{{< /alert >}}