<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :inline="true" :model="search">
        <el-form-item label="订单号">
          <el-input v-model="search.order_no" style="width: 220px" placeholder="订单号" clearable @clear="getList(1)" @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="交易HASH">
          <el-input v-model="search.hash" style="width: 220px" placeholder="交易HASH" clearable @clear="getList(1)" @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="search.phone" style="width: 220px" placeholder="手机号" clearable @clear="getList(1)" @keyup.enter.native="getList(1)" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="search.type" placeholder="请选择类型">
            <el-option v-for="(item, index) in typeOptions" :key="index" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker v-model="dateRangeValue" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right" @change="onChangeDateRange" />
        </el-form-item>
        <el-button icon="el-icon-search" @click="getList(1)">
          {{ $t('table.search') }}
        </el-button>
      </el-form>
    </div>
    <div class="panel-group">
      <div>
        <span>订单数：{{ order_total }}</span>
        <span>总奖励金额：￥{{ reward_total_price||0 }}</span>
        <span>首发总奖励金额：￥{{ reward_price||0 }}</span>
        <span>手续费总奖励金额：￥{{ reward_fee_price||0 }}</span>
      </div>
      <el-button :loading="downloadLoading" type="success" icon="el-icon-document" @click="onHandleDownload"> {{ $t('table.export') }} Excel </el-button>
    </div>
    <el-empty v-if="list.length === 0" v-loading="loading" description="暂无数据" />
    <el-table v-for="item in list" :key="JSON.stringify({ id: item.id })" class="order-table" :data="[item]" :cell-style="{ background: '#fff' }" :header-cell-style="headNone">
      <el-table-column>
        <template slot="header">
          <span># {{ item.id }}</span>
          <el-divider direction="vertical" />
          <span>订单号: {{ item.order ? item.order.order_no : '-' }}</span>
          <el-divider direction="vertical" />
          <span>下单时间：{{ item.order ? item.order.created_at : '-' }}</span>
        </template>
        <el-table-column width="300" header-align="center">
          <template slot-scope="{ row }">
            <div class="info-wrapper">
              <el-image
                class="image-item"
                :src="typeImage(row)"
                :preview-src-list="[typeImage(row)]"
              >
                <div slot="error" class="image-slot">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
              <div style="margin-left: 10px">
                <div class="goods-name"> 名称：{{ (row.order.goods && row.order.goods.name) || '' }} </div>
                <div v-if="row.order.target_type==='goods'" class="goods-properties"> 编号：{{ (row.order.goods && row.order.goods.serial) || '' }} </div>
                <div class="goods-properties"> 类型：{{ row.order.target_type | paraphrase(goodsOptions) }} </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="140">
          <template slot-scope="{ row }">
            <div>支付价格：￥{{ row.order.cny_price || 0 | moneyToFormat }}</div>
          </template>
        </el-table-column>
        <el-table-column min-width="170">
          <template slot-scope="{ row }">
            <div>
              奖励类型：<el-tag :type="row.order_type | paraphrase(rewardOptions, 'value', 'type')">{{ row.order_type | paraphrase(rewardOptions) }}</el-tag>
            </div>
            <div> 奖励比例：{{ row.percent || 0 }} </div>
            <div> 手续费奖励比例：{{ row.fee_percent || 0 }} </div>
          </template>
        </el-table-column>
        <el-table-column min-width="170">
          <template slot-scope="{ row,row:{order} }">
            <div v-if="row.order_type==='first'">实际支付：￥{{ (order.extend?order.extend.pay_price:row.price) ||0 |moneyToFormat }}</div>
            <div v-if="row.order_type==='fee'">
              实际手续费：
              <span v-if="order.consignment.extend">
                {{ (order.consignment.extend.charge_fee-order.consignment.extend.voucher_fee||order.consignment.extend.discount_fee) ||0 |moneyToFormat }}
              </span>
              <span v-else>'-'</span>
            </div>
            <div> 奖励金额：¥{{ row.reward_amount || 0 | moneyToFormat }} </div>
            <div> 手续费奖励金额：¥{{ row.fee_reward_amount || 0 | moneyToFormat }} </div>
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column width="280">
        <template slot-scope="{ row }">
          <div v-if="row.order.target_type==='goods'">
            <div class="address">合约地址：{{ row.order.goods ? row.order.goods.address : '-' }}</div>
            <div>交易HASH：{{ row.order? row.order.hash : '-' }}</div>
          </div>
          <div v-else style="text-align: center">---</div>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="pages.total > 0" :total="pages.total" :page.sync="pages.current" :limit.sync="pages.limit" @pagination="getList()" />
  </div>
</template>

<script>
import { getToken, DominKey } from '@/utils/auth'
import Pagination from '@/components/Pagination'
import { dataList, exportExcel } from '@/api/reward'
import { rewardOptions, pickerOptions, goodsOptions } from '@/utils/explain'

export default {
  name: 'Reward',
  components: { Pagination },
  data() {
    return {
      domin: getToken(DominKey),
      rewardOptions,
      pickerOptions,
      goodsOptions,
      dateRangeValue: [],
      loading: false,
      typeOptions: rewardOptions.slice(0, 3),
      list: [],
      search: {
        hash: '',
        order_no: '',
        type: '',
        phone: '',
        start_time: '',
        end_time: ''
      },
      order_total: 0,
      reward_total_price: 0,
      reward_price: 0,
      reward_fee_price: 0,
      downloadLoading: false,
      pages: {
        total: 0,
        limit: 20,
        current: 1
      }
    }
  },
  computed: {
    typeImage() {
      return (row) => {
        if (row.order_type === 'fee') {
          return (row.order.consignment.issuer_id ? '' : this.domin) + row.order.consignment.goods.images[0]
        } else {
          return this.domin + row.order.goods.images[0]
        }
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
      this.list = []
      if (this.loading) return
      this.loading = loading
      if (page === 1) this.pages.current = page
      dataList({ page, limit: this.pages.limit, ...this.search })
        .then(response => {
          this.list = response.data.lists.data
          this.pages.total = response.data.lists.total
          this.order_total = response.data.order_total
          this.reward_total_price = response.data.reward_total_price
          this.reward_price = response.data.reward_price
          this.reward_fee_price = response.data.reward_fee_price
        })
        .finally(() => {
          this.loading = false
        })
    },
    headNone({ row, colunm, rowIndex, columnIndex }) {
      if (rowIndex > 0) {
        return { display: 'none' }
      }
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
    onHandleDownload() {
      this.downloadLoading = true
      exportExcel()
        .then(response => {
          location.href = '/' + response.data.filename
        })
        .catch(_ => {})
        .finally(() => {
          this.downloadLoading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.info-wrapper {
	display: flex;
	.image-item {
		flex-shrink: 0;
		width: 100px;
		height: 100px;
		display: flex;
		align-items: center;
		img {
			height: auto;
		}
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
	}
}
::v-deep .el-table th {
	user-select: auto;
}
.order-table {
	margin-top: 20px;
}
.order-table .el-button + .el-button {
	margin-left: 0;
}
::v-deep .grid-content {
	color: #606266;
	font-size: 14px;
}
::v-deep .item .el-badge__content {
	transform: translateY(-50%) translateX(50%);
	z-index: 1;
}
::v-deep .el-radio-button:first-child .el-radio-button__inner {
	border-radius: 0;
	border-left: 0;
}
::v-deep .item:first-child .el-radio-button:first-child .el-radio-button__inner {
	border-left: 1px solid #dcdfe6;
	border-radius: 4px 0 0 4px;
}
::v-deep .item:last-child .el-radio-button:first-child .el-radio-button__inner {
	border-radius: 0 4px 4px 0;
}
::v-deep .item {
	.el-badge__content {
		transform: translateY(-50%) translateX(50%);
		z-index: 1;
	}
	&:first-child .el-radio-button:first-child .el-radio-button__inner {
		border-left: 1px solid #dcdfe6;
		border-radius: 4px 0 0 4px;
	}
	&:last-child .el-radio-button:first-child .el-radio-button__inner {
		border-radius: 0 4px 4px 0;
	}
}
::v-deep .el-radio-button:first-child .el-radio-button__inner {
	border-radius: 0;
	border-left: 0;
}
.goods-name {
	width: 170px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.panel-group {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;
	border-top: 1px solid #dfe6ec;
	span {
		margin-right: 20px;
		font-size: 14px;
		color: #333;
	}
}
.address{
  margin-bottom: 10px;
}
</style>
