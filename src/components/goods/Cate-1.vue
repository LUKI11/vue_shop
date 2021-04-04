<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域     -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格 -->
            <tree-table
            class="treeTable"
            :data="catelist"
            :columns="columns"
            :selection-type="false"
            :expand-type = "false"
            :show-index="true"
            index-text="#"
            border
            >
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false " style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0" >一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success" >二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="this.queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="this.total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        >
            <!-- 添加分类表单 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                    <el-form-item label="分类名称:" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>

                    <el-form-item label="父级分类:">
                        <!-- option用来指定数据源 -->
                        <!-- props用来配置对象 -->
                        <el-cascader
                        expand-trigger="hover"
                        :options="parentCateList"
                        :props="cascaderProps"
                        v-model="selectedKeys"
                        @change="parentCateChanged"
                        clearable
                        change-on-select
                        ></el-cascader>
                    </el-form-item>
                </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCateDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类数据列表
            catelist: [],
            // 总数据条数
            total: 0,
            // 为table指定列的定义
            columns: [{
                label: '分类名称',
                prop: 'cat_name'
            }, {
                label: '是否有效',
                // 将当前列定义为模板列
                type: 'template',
                // 当前列使用的模板名称
                template: 'isok'

            }, {
                label: '排序',
                // 将当前列定义为模板列
                type: 'template',
                // 当前列使用的模板名称
                template: 'order'

            }, {
                label: '操作',
                // 将当前列定义为模板列
                type: 'template',
                // 当前列使用的模板名称
                template: 'opt'
            }],
            // 控制添加分类对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类表单数据
            addCateForm: {
                // 将要添加的分类名称
                cat_name: '',
                // 父级分类id
                cat_pid: 0,
                // 当前分类等级,默认为一级分类
                cat_level: 0
            },
            // 添加分类表单认证规则对象
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类列表
            parentCateList: [],
            // cascader配置对象
            cascaderProps: {
                vaule: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选中的父级分类的Id数组
            selectedKeys: []
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

            if (res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败')
            }

            // 把数据赋值到页面的catelist里面，并且调用
            this.catelist = res.data.result
            // 为总数据条数赋值
            this.total = res.data.total
        },
        // 监听pagesize改变事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 监听pagenum 的改变
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        // 监听添加分类对话框
        showAddCateDialog() {
            // 现获取父级数据列表，再打开对话框
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        // 获取父级分类列表
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: { type: 2 }
            })

            if (res.meta.status !== 200) {
                return this.$message.error('获取父级分类数据失败！')
            }

            console.log(res.data)
            this.parentCateList = res.data
        },
        // 对话框选择项发生变化函数
        parentCateChanged() {
            console.log(this.selectedKeys)
        }
    }
}
</script>

<style lang="less" scoped>
    .treeTable{
        margin-top: 15px;
    }

    .el-cascader {
        width: 100%;
    }
</style>
