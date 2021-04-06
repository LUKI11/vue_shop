<template>
    <div>
         <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <!-- 搜索区域 -->
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表区域 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send">
                    <template slot-scope="scope">
                        <el-tag type="info">{{scope.row.is_send}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                        {{scope.row.create_time | dataFormat()}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" circle @click="showBox(scope.row.order_id)"></el-button>
                        <el-button type="success" icon="el-icon-location" circle @click="showProgressBox(scope.row.order_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页功能 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
        </el-card>

        <!-- 对话框区域 -->
        
        <!-- 修改地址对话框 -->
        <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        width="50%"
        @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <el-cascader
                v-model="addressForm.address1"
                :options="cityData"
                :props="{ expandTrigger: 'hover' }"
                ></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
        </el-dialog>
        <!-- 物流进度对话框 -->
        <el-dialog
        title="物流进度"
        :visible.sync="progressVisible"
        width="50%"
        >
        <span>这是一段信息</span>
        </el-dialog>

    </div>
</template>

<script>

import cityData from './citydata'

export default {
    data () {
        return {
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            total:0,
            orderlist:[],
            // 修改地址的显示与隐藏
            addressVisible: false,
            // 地址表单的数据
            addressForm:{
                address1:[],
                address2:''
            },
            // 地址表单的验证规则对象
            addressFormRules:{
                address1:[
                    { required: true, message: '请选择地址', trigger: 'blur' }
                ],
                address2:[
                    { required: true, message: '请填写详细地址', trigger: 'blur' }
                ]
            },
            // 当前修改的表单id
            editId:0,
            // 把导入的城市数据导入到Vue数据里面
            cityData:cityData,
            progressVisible: false,
            progressInfo:[]
        }
    },
    created() {
        this.getOrderList()
    },
    methods:{
        async getOrderList() {
            const{data:res} = await this.$http.get('orders',{
                params: this.queryInfo
            })
            if (res.meta.status !== 200) {
                return this.$message.error('获取订单列表失败！')
            }
            console.log(res.data);
            this.total = res.data.total
            this.orderlist = res.data.goods
        },
        // 控制pagesize的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        // 控制当前页的页码
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        // 控制修改地址对话框的显示与隐藏
        showBox(order_id) {
            this.editId = order_id
            this.addressVisible = true
        },
        // 修改地址对话框关闭事件
        addressDialogClosed() {
            this.$refs.addressFormRef.resetFields()
        },
        // 物流进度对话框事件
        showProgressBox(order_id) {
            // const { data:res } = await this.$http.get('/kuaidi/1106975712662')
            // this.progressInfo = res.data
            this.progressVisible = true

        }
    }
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>