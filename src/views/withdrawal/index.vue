<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="日期">
          <el-date-picker
            v-model="search.time"
            type="datetime"
            placeholder="选择日期时间"
            align="right"
            :picker-options="datePickerOptions"
          />
        </el-form-item>
        <el-form-item label="状态" style="margin-left: 10px">
          <el-radio-group v-model="search.status" size="mini" @change="getList(1)">
            <el-badge v-for="item in statusOptions" :key="item.value" :value="item.value === 0 && wait_count > 0 ? wait_count : ''" class="item">
              <el-radio-button :label="item.value">{{ item.label }}</el-radio-button>
            </el-badge>
          </el-radio-group>
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t('table.search') }}
        </el-button>
      </el-form>
    </div>
    <table class="table">
      <tr>
        <th>总返佣</th>
        <th>已提现返佣</th>
      </tr>
      <tr>
        <td>{{ total }}</td>
        <td>{{ already_total }}</td>
      </tr>
    </table>
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
        label="日期"
        align="center"
        prop="created_at"
        :formatter="formatter"
      />
      <el-table-column
        label="销售总额"
        align="center"
        prop="total_price"
      />
      <el-table-column
        label="销售返佣金额"
        align="center"
        prop="sell_amount"
      />
      <el-table-column
        label="手续费返佣金额"
        align="center"
        prop="fee_amount"
      />
      <el-table-column
        prop="status"
        label="提现状态"
        width="120"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status| paraphrase(statusOptions,'value','type')">{{ row.status| paraphrase(statusOptions) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="160"
        align="center"
      >
        <template slot-scope="{ row }">
          <div v-if="row.status === 0">
            <el-button type="primary" @click="onPassOrReject(row)">提现</el-button>
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit" @pagination="getList()" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { dataList, statusPass } from '@/api/withdrawal'
import { getToken, DominKey } from '@/utils/auth'
import { datePickerOptions } from '@/utils/explain'
export default {
  name: 'Withdrawal',
  components: { Pagination },
  data() {
    return {
      domin: getToken(DominKey),
      list: [],
      wait_count: 0,
      total: 0,
      already_total: 0,
      search: {
        time: '',
        status: ''
      },
      pages: {
        total: 0,
        limit: 20,
        current: 1
      },
      statusOptions: [
        { label: '全部', value: '' },
        { label: '待提交', value: 0, type: 'info' },
        { label: '待审核', value: 1, type: '' },
        { label: '通过', value: 2, type: 'success' },
        { label: '驳回', value: 3, type: 'danger' }
      ],
      dateRangeValue: [],
      datePickerOptions,
      loading: false
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
      dataList({ page, ...this.search, limit: this.pages.limit })
        .then(response => {
          this.list = response.data.list.data
          this.pages.total = response.data.list.total
          this.total = response.data.total || 0
          this.already_total = response.data.already_total || 0
          this.wait_count = response.data.wait_count || 0
        })
        .catch(() => { })
        .finally(() => {
          this.loading = false
        })
    },
    onPassOrReject(row) {
      this.$confirm(`是否确认提现, 是否继续?`, '提现审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        cancelButtonClass: 'btn-custom-cancel'
      }).then(() => {
        statusPass(row.id).then(({ msg }) => {
          this.$message.success(msg)
        })
      }).catch(() => {
      })
    },
    formatter(row, column, cellValue, index) {
      return cellValue.substring(0, 7).replace('-', '年') + '月'
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .image-slot {
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}
::v-deep .grid-content {
  color: #606266;
  font-size: 14px;
}

::v-deep .el-radio-group .item {
  .el-badge__content {
    transform: translateY(-50%) translateX(50%);
    z-index: 1;
  }
  .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 0;
    border-left: 0;
  }
  &:first-child .el-radio-button:first-child .el-radio-button__inner {
    border-left: 1px solid #dcdfe6;
    border-radius: 4px 0 0 4px;
  }
  &:last-child .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 0 4px 4px 0;
  }
}
.table{
  border:1px solid #dfe6ec;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 13px;
  th,td{
      min-width: 100px;
      padding: 6px 10px;
      border:1px solid #dfe6ec;
      text-align: center;
      color: #606266;
  }
    th{
  color: #909399;
  }
}
</style>
