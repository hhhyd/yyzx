<template>
    <el-row>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 12, offset: 6 }">
            <el-form :model="formData" ref="formData">
                <el-form-item label="">
                    <el-input placeholder="请输入用户名" v-model="formData.UserName" clearable prefix-icon="User"></el-input>
                    
                </el-form-item>
                <el-form-item label="">
                    <el-input placeholder="请输入密码" v-model="formData.password" show-password prefix-icon="Lock"></el-input>
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
                UserName: '',
                password: '',
                usertype: ''
            },
            userTypeOptions:[
                {value:'1',label:'系统管理员'},
                {value:'2',label:'护工'}
            ],
            checkNoPass:true,
            bindData:[{
                UserName:'admin',
                password:'12345',
                usertype:'1'
            },
        {
            UserName:'admin1',
            password:'12345',
            usertype:'1'
        },
    {
            UserName:'admin',
            password:'12345',
            usertype:'2'
        }]

        }
    },
    methods:{
        login(){
           
             let flag=false
             for(let i=0;i<this.bindData.length;i++){
                 if(this.bindData[i].UserName==this.formData.UserName&&
                 this.bindData[i].password==this.formData.password&&
                 this.bindData[i].usertype==this.formData.usertype){
                     flag=true
                 }
             }
             if(flag){
                 ElMessage.success('登录成功')
                   if(this.formData.usertype === '1'){
                    this.$router.push('/Breadcrumb')
                   }else if(this.formData.usertype === '2'){
                    this.$router.push('/nurse/daily')
                   }
             }else{
                 ElMessage.error('用户名或密码错误')
             }
        }
    }
}


</script>

<style></style>