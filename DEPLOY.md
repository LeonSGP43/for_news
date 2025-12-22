# 部署说明

## GitHub Actions 自动部署

### 1. 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub
```

### 2. 服务器配置

```bash
# 登录服务器
ssh user@your-server

# 添加公钥
echo "your_public_key_content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 创建项目目录
mkdir -p /home/user/news-monitor
cd /home/user/news-monitor
git init
git remote add origin https://github.com/your-username/for_news.git
git pull origin main
```

### 3. GitHub Secrets 配置

进入仓库 → Settings → Secrets and variables → Actions → New repository secret

添加以下 Secrets：

| 名称 | 值 |
|------|-----|
| `SERVER_HOST` | 服务器 IP（如 `47.101.161.15`） |
| `SERVER_USER` | SSH 用户名（如 `root`） |
| `SERVER_SSH_KEY` | SSH 私钥内容（`~/.ssh/github_deploy` 的内容） |
| `PROJECT_PATH` | 项目路径（如 `/home/user/news-monitor`） |
| `DB_HOST` | MySQL 主机 |
| `DB_USER` | MySQL 用户 |
| `DB_PASSWORD` | MySQL 密码 |
| `DB_NAME` | 数据库名 |
| `GEMINI_API_KEY` | Google Gemini API 密钥 |

### 4. 部署

**自动部署**：Push 代码到 `main` 分支
```bash
git add .
git commit -m "your message"
git push origin main
```

**手动部署**：在 GitHub Actions 中点击 "Run workflow"

### 5. 查看日志

```bash
# GitHub Actions 日志
# 进入仓库 → Actions → 选择最新工作流

# 服务器日志
ssh user@your-server
docker logs -f news-monitor
```

## 常见问题

**Q: 连接失败？**
```bash
ssh -i ~/.ssh/github_deploy user@your-server
```

**Q: 容器启动失败？**
```bash
docker logs news-monitor
docker ps | grep news-monitor
```

**Q: 如何手动部署？**
```bash
cd /home/user/news-monitor
git pull origin main
docker stop news-monitor || true
docker rm news-monitor || true
docker build -t news-monitor:latest .
docker run -d --name news-monitor --restart unless-stopped \
  -p 3111:3111 \
  -e NODE_ENV=production \
  -e DB_HOST=your_db_host \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_NAME=your_db_name \
  -e GEMINI_API_KEY=your_api_key \
  -e PORT=3111 \
  news-monitor:latest
```

详细说明见 `GITHUB_ACTIONS_SETUP.md`
