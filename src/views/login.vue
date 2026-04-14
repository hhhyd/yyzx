<template>
    <el-row>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 12, offset: 6 }">
            <el-form :model="formDate" ref="formData">
                <el-form-item label="">
                    <el-input placeholder="请输入用户名" v-model="formData.Username"></el-input>
                </el-form-item>
                <el-form-item label="">
                    <el-input placeholder="请输入密码" v-model="formData.Password"></el-input>
                </el-form-item>
                <el-form-item label="">
                    <el-select v-model="formData.usertype" placeholder="请选择用户类型">
                        <el-option v-for="item in userTypeOptions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>

export default {
    name: 'login',
    data() {
        return {
            formData: {
                Username: '',
                Password: '',
                usertype: ''
            },
            userTypeOptions:[
                {value:'1',label:'系统管理员'},
                {value:'2',label:'护工'}
            ]

        }
    },
    methods:{
        login(){
             this.$router.push('/Breadcrumb')
        }
    }
}
// 在登录成功的回调中

</script>

<style></style>