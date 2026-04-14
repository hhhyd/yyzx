<template>
    <el-row>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 12, offset: 6 }">
            <el-form :model="formData" ref="formData">
                <el-form-item label="">
                    <el-input placeholder="请输入用户名" v-model="formData.Username" clearable prefix-icon="User"></el-input>
                    
                </el-form-item>
                <el-form-item label="">
                    <el-input placeholder="请输入密码" v-model="formData.Password" show-password prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item label="">
                    <el-select v-model="formData.usertype" placeholder="请选择用户类型">
                        <el-option v-for="item in userTypeOptions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button :disabled="formData.checkNoPass" type="primary" @click="login" style="width: 100%;" plain>
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
import { ElMessage } from 'element-plus';
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
            ],
            checkNoPass:true,
            bindData:[{
                userName:'admin',
                password:'12345',
                usertype:'1'
            },
        {
            userName:'admin1',
            password:'12345',
            usertype:'1'
        }]

        }
    },
    methods:{
        login(){
           
             let flag=false
             for(let i=0;i<this.bindData.length;i++){
                 if(this.bindData[i].userName==this.formData.Username&&this.bindData[i].password==this.formData.Password&&this.bindData[i].usertype==this.formData.usertype){
                     flag=true
                 }
             }
             if(flag){
                 ElMessage.success('登录成功')
                   this.$router.push('/Breadcrumb')
             }else{
                 ElMessage.error('用户名或密码错误')
             }
        }
    }
}
// 在登录成功的回调中

</script>

<style></style>