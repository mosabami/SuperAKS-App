param nameseed string = 'superapp'
param location string = resourceGroup().location
param signedinuser string

//---------Kubernetes Construction---------
module aksconst 'aks-construction/bicep/main.bicep' = {
  name: 'aksconstruction'
  params: {
    location: location
    resourceName: nameseed
    enable_aad: true
    enableAzureRBAC: true
    registries_sku: 'Standard'
    omsagent: true
    retentionInDays: 30
    agentCount: 2
    agentVMSize: 'Standard_D2ds_v4'
    osDiskType: 'Managed'
    AksPaidSkuForSLA: true
    networkPolicy: 'azure'
    networkPluginMode: 'Overlay'
    azurepolicy: 'audit'
    acrPushRolePrincipalId: signedinuser
    adminPrincipalId: signedinuser
    AksDisableLocalAccounts: true
    custom_vnet: true
    upgradeChannel: 'stable'

    //Workload Identity requires OidcIssuer to be configured on AKS
    oidcIssuer: true

    //We'll also enable the CSI driver for Key Vault
    keyVaultAksCSI: true
  }
}
output aksOidcIssuerUrl string = aksconst.outputs.aksOidcIssuerUrl
output aksClusterName string = aksconst.outputs.aksClusterName

// deploy keyvault
module keyVault 'aks-construction/bicep/keyvault.bicep' = {
  name: 'kv${nameseed}'
  params: {
    resourceName: 'app${nameseed}'
    keyVaultPurgeProtection: false
    keyVaultSoftDelete: false
    location: location
    privateLinks: false
  }
}
output kvAppName string = keyVault.outputs.keyVaultName

resource superapp 'Microsoft.ManagedIdentity/userAssignedIdentities@2022-01-31-preview' = {
  name: 'id-super'
  location: location

  resource fedCreds 'federatedIdentityCredentials' = {
    name: nameseed
    properties: {
      audiences: aksconst.outputs.aksOidcFedIdentityProperties.audiences
      issuer: aksconst.outputs.aksOidcFedIdentityProperties.issuer
      subject: 'system:serviceaccount:superapp:serversa'
    }
  }
}
output idsuperappClientId string = superapp.properties.clientId
output idsuperappId string = superapp.id

module kvSuperappRbac 'kvRbac.bicep' = {
  name: 'superappKvRbac'
  params: {
    appclientId: superapp.properties.principalId
    kvName: keyVault.outputs.keyVaultName
  }
}

@description('Uses helm to install Workload Identity. This could be done via an AKS property, but is currently in preview.')
module aadWorkloadId 'workloadId.bicep' = {
  name: 'aadWorkloadId-helm'
  params: {
    aksName: aksconst.outputs.aksClusterName
    location: location
  }
}

output aksUserNodePoolName string = 'npuser01' //[for nodepool in aks.properties.agentPoolProfiles: name] // 'npuser01' //hardcoding this for the moment.
output nodeResourceGroup string = aksconst.outputs.aksNodeResourceGroup
