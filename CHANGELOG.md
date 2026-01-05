# 更新日志

本项目的所有重要变更都将记录在此文件中。

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式,
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [未发布]

## [0.1.0] - 2026-01-05

### 新增
- 优化虚拟机列表搜索功能
  - 添加搜索输入框防抖功能，停止输入 500ms 后发起请求
  - 将 search 参数改为 like_name，env 参数改为 like_env
  - 添加 vcenter 过滤条件，支持 VCSA-ZSC 选项
  - 移除状态过滤和电源状态过滤
  - 添加 API 请求调试日志

## [0.0.9] - 2025-12-24

### 新增
- 添加 target_id 字段到操作日志

## [0.0.8] - 2025-12-23

### 新增
- 添加操作记录功能和完善主机操作

## [0.0.7] - 2025-12-19

### 修复
- 修复 401 错误处理：使用 Route Handler 处理 signout

## [0.0.6] - 2025-12-18

### 新增
- 优化审批详情 Sheet 页面 UI 和交互

### 修复
- 修复 clearSessionAction 中 cookies() 的异步调用
- 实现 401 错误时自动清除 session 并重定向到登录页

## [0.0.5] - 2025-12-17

### 修复
- 修复 Next.js 16 构建错误和认证相关问题

## [0.0.4] - 2025-12-16

### 新增
- 迁移到 NextAuth 并修复 OAuth token 获取问题

### 修复
- 修复 Docker 构建时 OpenFGA 客户端初始化错误

## [0.0.3] - 2025-12-11

### 变更
- 从 NextAuth 迁移到 Better Auth

### 重构
- 更新虚拟化和企业微信群组组件

## [0.0.2] - 2025-12-10

### 重构
- 重构个人资料页面，优先使用服务端组件
- 重构虚拟机管理页面并添加权限控制

### 维护
- 更新 .dockerignore 忽略环境变量文件

## [0.0.1] - 2025-12-09

### 重构
- 按照 Next.js 15 最佳实践重构项目

## [0.0.0] - 2025-12-08

### 重构
- 移除 mounted 逻辑并修复 MutableRefObject 弃用警告
- 重组 lib 目录结构

## [初始版本] - 2025-12-04

### 新增
- 添加优化的 Dockerfile，使用多阶段构建用于 Next.js
- 首次提交

[未发布]: https://github.com/cvtestorg/next-cloudtruss/compare/8341f03...HEAD
[0.1.0]: https://github.com/cvtestorg/next-cloudtruss/compare/0559d72...8341f03
[0.0.9]: https://github.com/cvtestorg/next-cloudtruss/compare/3fb385a...0559d72
[0.0.8]: https://github.com/cvtestorg/next-cloudtruss/compare/6765b49...3fb385a
[0.0.7]: https://github.com/cvtestorg/next-cloudtruss/compare/1525072...6765b49
[0.0.6]: https://github.com/cvtestorg/next-cloudtruss/compare/d8b2c98...1525072
[0.0.5]: https://github.com/cvtestorg/next-cloudtruss/compare/d700c65...d8b2c98
[0.0.4]: https://github.com/cvtestorg/next-cloudtruss/compare/5d997dd...d700c65
[0.0.3]: https://github.com/cvtestorg/next-cloudtruss/compare/141767c...5d997dd
[0.0.2]: https://github.com/cvtestorg/next-cloudtruss/compare/7334cd6...141767c
[0.0.1]: https://github.com/cvtestorg/next-cloudtruss/compare/f0f1e92...7334cd6
[0.0.0]: https://github.com/cvtestorg/next-cloudtruss/compare/3874c5b...f0f1e92
[初始版本]: https://github.com/cvtestorg/next-cloudtruss/compare/cf3eb82...3874c5b
