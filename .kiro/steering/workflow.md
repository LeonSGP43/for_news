# 工作流程规范

## Commit 提交规范

每次完成代码修改后，必须提供 commit 提交文案，格式如下：

```
<type>(<scope>): <subject>

<body>
```

### Type 类型
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构（非新功能、非修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更

### Scope 范围
- `server`: 后端代码
- `client`: 前端代码
- `api`: API 相关
- `db`: 数据库相关
- `ai`: AI/Gemini 相关
- `i18n`: 国际化
- `config`: 配置文件

### 示例

```bash
feat(server): 添加文章搜索接口

- 新增 GET /api/articles/search 端点
- 支持按标题和描述模糊搜索
- 添加分页参数支持
```

```bash
fix(client): 修复新闻列表加载状态显示问题

修复了在数据加载完成后 loading 状态未正确重置的问题
```

## 必须遵守

- 每次代码变更后，将 commit 文案包裹在 code 块中输出
- 使用中文描述
- subject 不超过 50 字符
- body 说明具体改动内容
