# devil

## 大文件上传项目

客户端启动：

```shell
cd packages/big-file/upload-file-client &&
npm run dev
```

服务端启动：

```shell
cd packages/big-file/upload-file-server &&
npm run dev
```

### 依赖分析

默认打开浏览器显示依赖，无限深度
选项：
`--depth, -d <depth>` 选择深度
`--json, -j <json>` 选择输出脚本而不是浏览器打开

```shell
cd packages/dep-graph/cli &&
npm run analyze <root of your project>
```
