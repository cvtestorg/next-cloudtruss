# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: Bash("openskills read <skill-name>")
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>Agent-Skills-for-Context-Engineering</name>
<description>A comprehensive collection of Agent Skills for context engineering, multi-agent architectures, and production agent systems. Use when building, optimizing, or debugging agent systems that require effective context management.</description>
<location>global</location>
</skill>

<skill>
<name>changelog-automation</name>
<description>Automate changelog generation from commits, PRs, and releases following Keep a Changelog format. Use when setting up release workflows, generating release notes, or standardizing commit conventions.</description>
<location>global</location>
</skill>

<skill>
<name>frontend-design</name>
<description>Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.</description>
<location>global</location>
</skill>

<skill>
<name>nextjs-app-router-patterns</name>
<description>Master Next.js 14+ App Router with Server Components, streaming, parallel routes, and advanced data fetching. Use when building Next.js applications, implementing SSR/SSG, or optimizing React Server Components.</description>
<location>global</location>
</skill>

<skill>
<name>obsidian-daily-note</name>
<description>管理 Obsidian 每日工作日志的完整工具集. 用于创建、更新、删除 Obsidian 目录下的工作日志文件, 支持任务管理、任务合并、状态更新、工作日志记录等功能. 使用场景包括: (1) 创建或更新指定日期的工作日志, (2) 添加、完成、删除每日任务, (3) 记录工作日志条目, (4) 自动合并相同任务避免重复, (5) 按需创建月份目录和日志文件. 日志存储在 /Users/zhangsan/Documents/obsidian/dailywork/DailyNote/2026 目录下, 按月份组织 (2026-01 到 2026-12), 文件命名格式为 YYYY-MM-DD.md.</description>
<location>global</location>
</skill>

<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.</description>
<location>global</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
