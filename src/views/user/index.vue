<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="姓名">
          <el-input v-model="search.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="账户">
          <el-input v-model="search.phone" placeholder="请输入账户" />
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t('table.search') }}
        </el-button>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      border
      highlight-current-row
      :data="list"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
        align="center"
      />
      <el-table-column
        label="用户姓名"
        align="center"
        prop="name"
      />
      <el-table-column
        label="用户账户"
        align="center"
        prop="phone"
      />
      <el-table-column
        label="实名姓名"
        align="center"
      >
        <template slot-scope="{row}">
          {{ row.certification?row.certification.name:'' }}
        </template>
      </el-table-column>
      <el-table-column
        label="邀请人"
        align="center"
      >
        <template slot-scope="{row}">
          <div v-if="row.inviter">
            <div>昵称：{{ row.inviter.name }}</div>
            <div>电话：{{ row.inviter.phone }}</div>
            <div>姓名：{{ row.inviter.certification&&row.inviter.certification.name||'' }}</div>
          </div>

        </template>
      </el-table-column>
      <el-table-column
        label="登录时间"
        align="center"
        prop="updated_at"
      />
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit" @pagination="getList()" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { dataList } from '@/api/user'
import { whetherOptions, shopStatusOptions, payOptions, orderTypeOptions, pickerOptions, orderStatusOptions } from '@/utils/explain'
import { DominKey, getToken } from '@/utils/auth'
export default {
  name: 'User',
  components: { Pagination },
  data() {
    return {
      domin: getToken(DominKey),
      loading: false,
      dateRangeValue: [],
      search: {
        name: '',
        phone: ''
      },
      list: [],
      exportOptions: [
        { label: '全部', value: '' },
        { label: '商品订单', value: 'entity_order' },
        { label: '藏品订单', value: 'order' },
        { label: '用户藏品筛选', value: 'serial_user' },
        { label: '用户列表', value: 'user' }
      ],
      whetherOptions,
      shopStatusOptions,
      payOptions,
      pickerOptions,
      orderTypeOptions,
      orderStatusOptions,
      identityOptions: [],
      pages: {
        total: 0,
        limit: 20,
        current: 1
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.getList()
    },
    getList(page = this.pages.current, loading = true) {
      if (this.loading) return
      this.loading = loading
      if (page === 1) this.pages.current = page
      dataList({ page, limit: this.pages.limit, ...this.search })
        .then(response => {
          this.list = response.data.data.map(v => {
            v.btnLoading = false
            return v
          })
          this.pages.total = response.data.total
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    onChangeDateRange(value) {
      if (Array.isArray(value)) {
        this.search.start_time = value[0]
        this.search.end_time = value[1]
      } else {
        this.search.start_time = this.search.end_time = ''
        this.getList(1)
      }
    },
    onHandleDownload(row) {
      row.btnLoading = true
      try {
        location.href = this.domin + row.file_name
      } catch (error) {
        this.$message.error('下载失败')
      } finally {
        row.btnLoading = false
      }
    }
  }
}
</script>

<style  scoped>
.text:not(:last-child)::after{
  content: '，';
}
.app-container{
/* width: 1500px; */
}
</style>
