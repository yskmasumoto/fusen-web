# クリック＆ドラッグ付箋アプリ

このプロジェクトは、React と TypeScript を使用して開発された、クリックとドラッグが可能な付箋アプリケーションです。ユーザーは画面上で付箋を自由に移動させることができます。

## 機能

- クリック可能な青い四角形（付箋）の表示
- 付箋のドラッグ＆ドロップ機能
- 日本語メッセージの表示

## プロジェクト構成

```
.
├── README.md
├── bun.lockb
├── farm.config.ts
├── index.html
├── package.json
├── public
│   └── favicon.ico
├── src
│   ├── assets
│   │   ├── logo.png
│   │   └── react.svg
│   ├── index.css
│   ├── index.tsx
│   ├── main.css
│   ├── main.tsx
│   └── typings.d.ts
├── tsconfig.json
└── tsconfig.node.json
```

## セットアップ

1. リポジトリをクローンします：
   ```
   git clone https://github.com/yskmasumoto/fusen-web.git
   ```

2. プロジェクトディレクトリに移動します：
   ```
   cd fusen-web
   ```

3. 依存関係をインストールします：
   ```
   bun install
   ```

4. アプリケーションを起動します：
   ```
   bun run dev
   ```

## 開発

- `main.tsx`: アプリケーションのメインコンポーネントが含まれています。
- `index.tsx`: アプリケーションのエントリーポイントです。
- `main.css`: スタイリングを担当します。

## 今後の開発予定

- 複数の付箋の追加機能
- 付箋のリサイズ機能
- 色変更オプションの実装
- 付箋に書いた内容の保存

## 

---

このプロジェクトは開発中です。機能の追加や改善に関するフィードバックを歓迎します。