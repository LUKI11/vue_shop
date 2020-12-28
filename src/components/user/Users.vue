<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 搜索添加区域 -->
            <div style="margin-top: 15px;">
                <el-row :gutter="20">
                    <el-col :span="7">
                        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                    </el-col>
                </el-row>
            </div>

            <!-- 用户列表区 -->
            <el-table :data="userList" :stripe=true :border=true>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <!-- {{scope.row.mg_state}} -->
                        <el-switch
                        v-model="scope.row.mg_state"
                        @change="userStateChange(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip content="修改" placement="top" :enterable=false>
                            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)"></el-button>  
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip content="删除" placement="top" :enterable=false>
                            <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)"></el-button>  
                        </el-tooltip>
                        <!-- 角色分配按钮 -->
                        <el-tooltip content="角色分配" placement="top" :enterable=false>
                            <el-button type="warning" icon="el-icon-setting"></el-button>  
                        </el-tooltip>                      
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 内容主体区 -->
            <el-form :model="addForm"
            label-position="left"
            :rules="addFormRules" 
            ref="addFormRef" 
            label-width="70px"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>       
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>       
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>       
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>       
                </el-form-item>      
            </el-form>
            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <!-- 内容主体区 -->
            <el-form :model="editForm"
            label-position="left"
            :rules="editFormRules" 
            ref="editFormRef" 
            label-width="70px"
            >
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" :disabled="true"></el-input>       
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>       
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>       
                </el-form-item>      
            </el-form>
            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除用户对话框 -->
    </div>
</template>

<script>
export default {
    data() {
        // 验证邮箱规则
        var checkEmail = (rule,value,callback)=>{
            // 验证邮箱的正则表达式
            const regEmail = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
            if (regEmail.test(value)) {
                return callback()
            }

            callback(new Error('请输入合法的邮箱'))
        }
        // 验证手机号规则
        var checkMobile = (rule,value,callback)=>{
            // 验证手机号的正则表达式
            const regMobile = /^[1]([3-9])[0-9]{9}$/;
            if (regMobile.test(value)) {
                return callback()
            }

            callback(new Error('请输入合法的手机号'))

        }
        return {
            // 获取用户列表参数对象
            queryInfo:{
                query:'',
                // 当前页数
                pagenum:1,
                // 每页显示多少数据
                pagesize:2
            },
            userList:[],
            total:0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 添加表单的验证规则对象
            addFormRules:{
                username: [
                    {required:true, message:'请输入用户名',trigger:'blur'},
                    {min:3, max:10, message:'用户名长度在3-10字符之间', trigger:'blur'}
                ],
                password:[
                    {required:true, message:'请输入密码',trigger:'blur'},
                    {min:6, max:15, message:'邮箱长度在6-15字符之间', trigger:'blur'}
                ],
                email:[
                    {required:true, message:'请输入邮箱',trigger:'blur'},
                    {validator:checkEmail,trigger:'blur'}
                ],
                mobile:[
                    {required:true, message:'请输入手机号码',trigger:'blur'},
                    {validator:checkMobile,trigger:'blur'}
                ]
            },
            // 修改用户对话框的显示隐藏
            editDialogVisible: false,
            // 查询到的用户信息对象
            editForm:{},
            editFormRules:{
                email:[
                    {required:true, message:'请输入邮箱',trigger:'blur'},
                    {validator:checkEmail,trigger:'blur'}
                ],
                mobile:[
                    {required:true, message:'请输入手机号码',trigger:'blur'},
                    {validator:checkMobile,trigger:'blur'}
                ]
            }
        }
    },
    created() {
        this.getUserList()
    },
    methods:{
        async getUserList() {
            const {data:res} = await this.$http.get('users',{params:this.queryInfo})
            if (res.meta.status !== 200) return this.$message.error('获取用户列表失败');
            this.userList = res.data.users
            this.total = res.data.total
        },
        // 监听 pageSize(每页显示多少数据) 改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getUserList();
        },
        // 监听 页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getUserList();
        },
        // 监听switch 用户开关状态的改变
        async userStateChange(userInfo) {
            const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if (res.meta.status !==200 ) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error('更新用户状态失败');
                }
            this.$message.success('更新成功')
        },
        // 监听添加用户对话框关闭事件
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        // 点击按钮添加新用户
        addUser() {
             this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                // 可以发起添加用户的请求
                const {data:res} = await this.$http.post('users', this.addForm)
                if (res.meta.status !== 201) {
                    this.$message.error('添加新用户失败');
                }
                this.$message.success('添加用户成功');
                // 隐藏添加对话框
                this.addDialogVisible = false;
                // 重新获取用户列表
                this.getUserList();
             })
        },
        // 展示编辑用户对话框
        async showEditDialog(id) {
            const {data:res} = await this.$http.get('users/'+id)
            if (res.meta.status !== 200) {
                return this.$message.error('查询失败')
            }
            this.editForm = res.data
            this.editDialogVisible = true;
            this.getUserList();
        },
        // 监听修改用户对话框关闭事件
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        // 用户修改信息并提交
        editUserInfo () {
            this.$refs.editFormRef.validate( async valid => {
                if (!valid) return;
                // 发起用户修改的请求
                const {data:res} = await this.$http.put('users/'+this.editForm.id,{
                    email:this.editForm.email,
                    mobile:this.editForm.mobile
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('更新用户信息失败')
                }
                // 关闭修改对话框
                this.editDialogVisible = false
                this.getUserList()
                this.$message.success('修改用户成功');
            })
        },
        // 用户删除
        async removeUserById(id) {
            // 弹框提示是否删除
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            })
            .catch(()=>{
                this.$message({
                type: 'info',
                message: '已取消删除'
            })
            })

            if (confirmResult == 'confirm') {
                // 发送删除请求
                const {data:res} = await this.$http.delete('users/' + id)
                if (res.meta.status !== 200) {
                    return this.$message.error('删除用户失败')
                }
                this.getUserList()
                this.$message.success('删除用户成功');
            }
        }
    }
}
</script>

<style lang="less" scoped>

</style>