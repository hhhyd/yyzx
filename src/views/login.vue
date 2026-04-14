<template>
    <el-row>
        <el-col :xs="{ span: 24, offset: 0 }" :sm="{ span: 12, offset: 6 }">
            <el-form :model="formDate" ref="formData">
                <el-form-item label="">
                    <el-input placeholder="请输入用户名" v-model="Username"></el-input>
                </el-form-item>

            </el-form>
        </el-col>
    </el-row>
</template>

<script>
export default{
    name: 'login',
    data(){
       return{
        formData:{
            Username:''
        },

       }}
    }

</script>

<style></style>