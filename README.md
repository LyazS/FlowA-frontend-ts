# FlowA-frontend-ts

## 新方向
仿造comfyui的调试

缓存键通常由节点类型和输入参数生成，确保唯一性。

cfui每次运行会缓存节点在内存
使用ws来同步数据

fa呢？用sse来同步，用http来请求

增量运行/全量运行
统一一下

## 架构设计
前端只做展示，后端只做计算

前端只需要维持一个wid，然后总是展示最新的tid？
前端编辑节点，然后发送运行，
后端收到执行，sse返回运行状态

数据库只是一个缓存作用

### 增量执行
* 节点检验
* 节点计算hash值，然后搜索数据库是否存在他的缓存，有则加载缓存，否则执行计算
* 计算完成后，将结果缓存到数据库
* 计算hash值需要计算他的前置节点的hash值，递归计算
### 全量执行
* 执行前，先将当前工作流的历史记录全部清空
* 再按照增量来执行