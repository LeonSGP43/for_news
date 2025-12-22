# GitHub Actions 自动部署设置指南

## 概述

这个工作流会在每次 push 到 `main` 分支时，自动构建 Docker 镜像并部署到你的服务器。

## 前置要求

1. **GitHub 仓库** - 已推送代码
2. **服务器** - 安装了 Docker 和 Docker Compose
3. **SSH 密钥** - 用于连接服务器

## 设置步骤

### 1. 生成 SSH 密钥对（如果还没有）

在你的本地机器上：

```bash
# 生成 SSH 密钥（不设置密码）
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""

# 查看公钥
cat ~/.ssh/github_deploy.pub
```

### 2. 在服务器上添加公钥

```bash
# 登录服务器
ssh user@your-server

# 添加公钥到 authorized_keys
echo "your_public_key_content" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. 在 GitHub 仓库中添加 Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下 Secrets：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SERVER_HOST` | 服务器 IP 或域名 | `47.101.161.15` |
| `SERVER_USER` | SSH 用户名 | `root` |
| `SERVER_SSH_KEY` | SSH 私钥内容 | （粘贴 `~/.ssh/github_deploy` 的内容） |
| `PROJECT_PATH` | 项目在服务器上的路径 | `/home/user/news-monitor` |
| `DB_HOST` | MySQL 主机 | `47.101.161.15` |
| `DB_USER` | MySQL 用户 | `root` |
| `DB_PASSWORD` | MySQL 密码 | `your_password` |
| `DB_NAME` | 数据库名 | `theNews` |
| `GEMINI_API_KEY` | Google Gemini API 密钥 | `AIzaSy...` |

### 4. 在服务器上准备项目目录

```bash
# 登录服务器
ssh user@your-server

# 创建项目目录
mkdir -p /home/user/news-monitor
cd /home/user/news-monitor

# 初始化 git 仓库（可选，如果还没有）
git init
git remote add origin https://github.com/your-username/for_news.git

# 拉取代码
git pull origin main
```

### 5. 测试部署

#### 方式 A：手动触发工作流

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Deploy to Server" 工作流
4. 点击 "Run workflow" → "Run workflow"

#### 方式 B：推送代码触发

```bash
# 本地修改代码后
git add .
git commit -m "test deployment"
git push origin main

# 然后在 GitHub Actions 中查看部署进度
```

## 工作流说明

### 触发条件

- **自动触发**：push 到 `main` 分支
- **手动触发**：在 GitHub Actions 中点击 "Run workflow"

### 执行步骤

1. **Checkout** - 检出代码
2. **SSH 连接** - 连接到服务器
3. **拉取代码** - `git pull origin main`
4. **停止旧容器** - 停止并删除旧的 Docker 容器
5. **构建镜像** - `docker build -t news-monitor:latest .`
6. **运行容器** - 启动新的 Docker 容器
7. **验证** - 检查容器是否正常运行

## 查看部署日志

### GitHub Actions 日志

1. 进入仓库 → Actions
2. 选择最新的工作流运行
3. 点击 "deploy" job 查看详细日志

### 服务器日志

```bash
# 查看容器日志
docker logs -f news-monitor

# 查看容器状态
docker ps | grep news-monitor

# 查看应用日志
docker exec news-monitor tail -f logs/server-out.log
```

## 故障排查

### 连接失败

```bash
# 测试 SSH 连接
ssh -i ~/.ssh/github_deploy user@your-server

# 检查 authorized_keys
cat ~/.ssh/authorized_keys
```

### 容器启动失败

```bash
# 查看容器日志
docker logs news-monitor

# 检查环境变量
docker inspect news-monitor | grep -A 20 "Env"

# 手动测试数据库连接
docker exec news-monitor npm run server
```

### 镜像构建失败

```bash
# 本地测试构建
docker build -t news-monitor:latest .

# 查看构建日志
docker build --progress=plain -t news-monitor:latest .
```

## 高级配置

### 1. 添加通知

在工作流中添加失败通知（邮件、Slack 等）：

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment failed!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. 添加健康检查

```yaml
- name: Health check
  run: |
    sleep 10
    curl -f http://${{ secrets.SERVER_HOST }}:3111/api/health || exit 1
```

### 3. 自动回滚

```yaml
- name: Rollback on failure
  if: failure()
  run: |
    ssh -i ${{ secrets.SERVER_SSH_KEY }} ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }} \
      "cd ${{ secrets.PROJECT_PATH }} && docker run -d --name news-monitor-rollback ..."
```

## 安全建议

1. **SSH 密钥**
   - 使用 Ed25519 密钥（更安全）
   - 不要在代码中提交私钥
   - 定期轮换密钥

2. **Secrets**
   - 不要在日志中打印敏感信息
   - 定期更新密码和 API 密钥
   - 使用环境变量而不是硬编码

3. **服务器**
   - 限制 SSH 访问 IP
   - 使用防火墙规则
   - 定期更新系统和依赖

## 常见问题

### Q: 如何禁用自动部署？

在 `.github/workflows/deploy.yml` 中注释掉 `push` 触发器：

```yaml
# on:
#   push:
#     branches:
#       - main
  workflow_dispatch:
```

### Q: 如何部署到多个服务器？

创建多个 job，每个 job 部署到不同的服务器：

```yaml
jobs:
  deploy-prod:
    # 部署到生产服务器
  deploy-staging:
    # 部署到测试服务器
```

### Q: 如何跳过某次部署？

在 commit message 中添加 `[skip ci]`：

```bash
git commit -m "Update docs [skip ci]"
```

## 联系支持

如有问题，请查看 GitHub Actions 日志或联系开发团队。
