// # 资源管理权限
// define can_add_disk: admin or member
// define can_expand: admin or member  # CPU/内存扩容
// define can_rename: admin or member
// define can_recycle: admin  # 资源回收
// define can_archive: admin  # 资源归档
// define can_transfer: admin  # 过户
// define can_renew: admin or member  # 续期
// define can_change_purpose: admin or member  # 用途变更
// define can_bind_project: admin  # 绑定项目
// define can_sync: admin or member  # 手动同步
// define can_set_role: admin  # 角色设置
// # 备份和快照权限
// define can_create_snapshot: admin or member  # 创建快照, 仅授权资源管理员和服务管理员操作
// define can_restore_snapshot: admin or member  # 恢复快照, 仅授权资源管理员和服务管理员操作
// define can_delete_snapshot: admin or member  # 删除快照, 仅授权资源管理员和服务管理员操作
// # 标签和分类权限
// define can_manage_tags: admin or member  # 管理标签
// define can_classify: admin or member  # 分类资源
// # 审批申请权限（审批权限在审批流应用中定义）
// define can_request_approval: admin or member  # 申请审批

export const VIRTUAL_MACHINE_PERMISSIONS = [
  "can_read", // 查看虚拟机
  "can_start", // 开机
  "can_shutdown", // 关机
  "can_restart", // 重启
  "can_suspend", // 挂起
  "can_add_disk", // 新增磁盘
  "can_expand", // CPU/内存扩容
  "can_rename", // 重命名
  "can_recycle", // 资源回收
  "can_archive", // 资源归档
  "can_transfer", // 过户
  "can_renew", // 续期
  "can_change_purpose", // 用途变更
  "can_bind_project", // 绑定项目
  "can_sync", // 手动同步
  "can_set_role", // 角色设置
  "can_create_snapshot", // 创建快照
  "can_restore_snapshot", // 恢复快照
  "can_delete_snapshot", // 删除快照
  "can_manage_tags", // 管理标签
  "can_classify", // 分类资源
  "can_request_approval", // 申请审批
];
