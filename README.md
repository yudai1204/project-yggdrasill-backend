# 芝浦祭 2024 - Project Yggdrasil

フロントエンドに詳細は記載

## Azure Container Apps への再デプロイ手順

0. Azure CLI でログイン

```
az login
```

```
az acr login --name $REGISTRY_NAME
```

1. Docker イメージの再ビルド
   latest タグを再利用しても良いですが、バージョン管理しやすくするために v1.1 や 2024-10-29 のように新しいタグを追加するのもおすすめです。例: `docker build -t yggdrasil:v1.1 .`

```
docker build --platform=linux/amd64 -t $REGISTRY_NAME.azurecr.io/project-yggdrasill-backend:latest .
```

2. Azure Container Registry へのプッシュ

```
docker push $REGISTRY_NAME.azurecr.io/project-yggdrasill-backend:latest
```

3. Azure Container Apps の更新
   イメージをプッシュした後に、Azure Container Apps を新しいイメージに更新します。

```
az containerapp update \
  --name project-yggdrasill-backend \
  --resource-group $RESOURCE_GROUP \
  --image $REGISTRY_NAME.azurecr.io/project-yggdrasill-backend:latest
```

4. 更新の反映確認
   更新が完了すると、コンテナが新しいイメージを使用して再起動します。Azure Portal でログやコンテナのステータスを確認し、更新が正常に反映されていることを確認してください。

5. Azure Portal 内の最新の状態に更新を押して再起動

## Azure Container Apps の URL

https://portal.azure.com/?Microsoft_Azure_Education_correlationId=115ae57a-8417-4c96-b576-15d82abbc218#@shibaura3.onmicrosoft.com/resource/subscriptions/b54a8e4c-1589-4ba2-b89a-c91052aee35a/resourceGroups/shibafes2024/overview

https://portal.azure.com/?Microsoft_Azure_Education_correlationId=115ae57a-8417-4c96-b576-15d82abbc218#@shibaura3.onmicrosoft.com/resource/subscriptions/b54a8e4c-1589-4ba2-b89a-c91052aee35a/resourceGroups/shibafes2024/providers/Microsoft.App/containerApps/project-yggdrasill-backend/containerapp
