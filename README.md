# ERM

ERM (Embedding-Resource Map) is a binary file format that keep track of the embeddings of resources in a dataset. It's designed to be extremely fast to read embeddings and manipulate them in a constrained environment, such as a browser.

Using ERM, you can store embeddings of resources in a single file, serve it to the client, and use computing power of the client to manipulate the embeddings (cosine similarity, etc.) for search and recommendation purposes. The ERM file can be cached and compared securely on the client browser without extra server requests.

## Format

```md
[1.2, -0.8, 0.9] - https://url.com/resource1
[1.5, 0.2, -1.3] - {"type": "image", "url": "https://url.com/resource2"}
[0.3, 0.1, 0.5] - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
```

## Usage

## Build

```bash
npx webpack
```
