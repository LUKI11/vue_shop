<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddRoleVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id" >
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                                    {{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级三级权限 -->
                            <el-col :span="19">
                                <!-- 二级权限 通过for循环嵌套渲染 -->
                                <el-row :class="[i2 === 0 ? '':'bdtop','vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>

                        <!-- <pre>
                           {{scope.row}}
                        </pre> -->
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" @click="deleteRight(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 对话框区域 -->

        <!-- 分配权限对话框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
        >
        <!-- 树形控件 -->
        <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox node-key='id'
        default-expand-all
        :default-checked-keys='defKeys'
        ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="alloRights">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 添加角色对话框 -->
        <el-dialog
        title="添加角色"
        :visible.sync="showAddRoleVisible"
        width="50%"
        @close="addDialogClosed"
        >
        <el-form :model="addRoleForm" :rules="addRolRules" ref="addRolRef" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addRoleForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="showAddRoleVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
        </el-dialog>

        <!-- 编辑角色对话框 -->
        <el-dialog
        title="编辑角色"
        :visible.sync="showEditRoleVisible
        "
        width="50%"
        @close="editDialogClosed"
        >
        <el-form :model="editRoleForm" :rules="editRolRules" ref="editRolRef" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editRoleForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editRoleForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="showEditRoleVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 所有角色列表数据
            rolesList: [],
            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            // 所有权限的数据
            rightsList: [],
            // 树形控件的属性绑定对象
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中的节点id数组
            defKeys: [],
            // 当前需要分配权限的id
            roleId: '',
            // 控制添加角色的对话框显示与隐藏
            showAddRoleVisible:false,
            // 添加角色表单数据
            addRoleForm:{
                roleName:'',
                roleDesc:''
            },
            // 添加角色的认证规则
            addRolRules:{
                roleName:[{ required: true, message: '请输入角色名称', trigger: 'blur' }],
                roleDesc:[{ required: true, message: '请输入角色描述', trigger: 'blur' }]        
            },
            // 控制编辑角色对话框的显示与隐藏
            showEditRoleVisible:false,
            // 编辑角色的数据表单
            editRoleForm:{},
            // 编辑角色的认证规则
            editRolRules:{
                roleName:[{ required: true, message: '请输入角色名称', trigger: 'blur' }],
                roleDesc:[{ required: true, message: '请输入角色描述', trigger: 'blur' }]
            }
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        // 获取所有角色列表
        async getRolesList () {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            this.rolesList = res.data
        },
        // 根据id删除对应权限
        async removeRightById(role, rightId) {
            // 弹框提示用户是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch((err) => { err })
            if (confirmResult !== 'confirm') {
                return this.$message.info('取消删除')
            }
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败！')
            }
            role.children = res.data
        },
        // 通过递归的形势获取角色下所有三级权限的id并保存到defKeys数组
        getLeftKeys (node, arr) {
            // 如果当前node节点没有children属性，就是三集标签
            if (!node.children) {
                return arr.push(node.id)
            }

            node.children.forEach((item) => {
                this.getLeftKeys(item, arr)
            })
        },
        // 展示分配权限的对话框
        async showSetRightDialog (role) {
            this.roleId = role.id
            // 获取所有权限的数据
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限数据失败！')
            }
            // 把获取到的权限数据保存到data中
            this.rightsList = res.data
            // 获取三级节点的id
            this.getLeftKeys(role, this.defKeys)
            this.setRightDialogVisible = true
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed () {
            this.defKeys = []
        },
        // 点击为角色分配权限
        async alloRights () {
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]

            const idStr = keys.join(',')

            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

            if (res.meta.status !== 200) {
                return this.$message.error('更新用户权限失败！')
            }

            this.$message.success('更新用户权限成功')
            this.getRolesList()
            this.setRightDialogVisible = false
        },
        // 删除角色
        async deleteRight(id) {
            // 弹框提示是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            })
            .catch(() => {
                this.$message({
                type: 'info',
                message: '已取消删除'
            })
            })

            if (confirmResult == 'confirm') {
                // 发送删除请求
                const { data: res } = await this.$http.delete('roles/' + id)
                if (res.meta.status !== 200) {
                    return this.$message.error('删除角色失败')
                }
                this.getRolesList()
                this.$message.success('删除角色成功')
            }
        },
        // 添加角色
        addRole() {
            this.$refs.addRolRef.validate(async valid => {
                if (!valid) {return this.$message.error('请输入正确的角色信息')}
                const {data:res} = await this.$http.post('roles', this.addRoleForm)
                if (res.meta.status !== 201) {return this.$message.error('添加角色失败')}
                this.$message.success('添加角色成功')
                this.showAddRoleVisible = false
                this.getRolesList()
            })           
        },
        // 监听添加角色的关闭事件
        addDialogClosed() {
            this.$refs.addRolRef.resetFields()
        },
        // 编辑表单对话框的显示与隐藏
        async showEditDialog(id) {
            const {data:res} = await this.$http.get('roles/'+id)
            if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
            this.editRoleForm = res.data
            this.showEditRoleVisible =true
            this.getRolesList()
        },
        // 监听编辑表单的提交事件
        editRole() {
            this.$refs.editRolRef.validate(async valid => {
                if (!valid) return this.$message.error('请输入正确的角色信息！')
                // 发起角色修改请求
                const {data:res} = await this.$http.put('roles/' + this.editRoleForm.roleId, {
                    roleName:this.editRoleForm.roleName,
                    roleDesc:this.editRoleForm.roleDesc
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('编辑角色信息失败！')
                }
                this.showEditRoleVisible = false
                this.getRolesList()
                this.$message.success('编辑角色信息成功')
            })
        },
        // 监听编辑表单对话框的关闭事件
        editDialogClosed() {
            this.$refs.editRolRef.resetFields()
        }      
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
