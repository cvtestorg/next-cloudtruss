## 实现 VSwitch 字段的下拉框数据从 API 获取

### 需求分析
- 虚拟机申请单中的 VSwitch 字段需要从 API 获取下拉框数据
- 参考现有的 VLAN 字段实现方式
- 使用已有的 `getVSwitchListAction` API 函数

### 实现步骤

#### 1. 添加 VSwitch 数据状态管理
在 `VmHostFormFields` 组件中添加以下状态：
- `vswitchList`: 存储每个主机的 VSwitch 列表
- `isLoadingVswitch`: 存储每个主机的 VSwitch 加载状态
- `vswitchError`: 存储每个主机的 VSwitch 加载错误

#### 2. 实现 VSwitch 列表获取函数
创建 `fetchVswitchList` 函数，参考 `fetchVlanList` 的实现：
- 接收主机索引、vcluster 和 vcenter 参数
- 调用 `getVSwitchListAction` API
- 处理加载状态和错误
- 自动选择第一个选项（如果有）

#### 3. 修改 VSwitch 字段实现
更新现有的 VSwitch 字段：
- 添加加载状态和错误处理
- 使用从 API 获取的 VSwitch 数据
- 添加重试功能
- 禁用逻辑：当没有选择集群或云链接时禁用

#### 4. 集成到现有流程
- 在选择集群后自动获取 VSwitch 列表（参考 VLAN 的实现）
- 确保在复制主机时正确处理 VSwitch 数据
- 保持与其他字段一致的动画效果

#### 5. 测试和验证
- 确保 VSwitch 下拉框能够正确加载数据
- 验证加载状态和错误处理
- 测试自动选择功能
- 确保与其他字段的交互正常

### 技术要点
- 遵循现有的代码模式和架构
- 使用相同的状态管理方式
- 保持与其他字段一致的用户体验
- 确保错误处理和边界情况的处理