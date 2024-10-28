# ベースイメージの選択
FROM node:20

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションのビルド
RUN npm run build

# 使用するポート番号を定義
ENV PORT=3210
EXPOSE 3210

# アプリケーションの起動コマンド
CMD ["npm", "run", "start"]
