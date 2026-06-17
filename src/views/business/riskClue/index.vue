<template>
  <div
    class="risk-clue-page"
    :class="{ 'has-drawer': drawerVisible, 'risk-clue-page--embedded': embedded }"
  >
    <div v-if="drawerVisible" class="page-backdrop" @click="closeDetailDrawer" />
    <!-- LEFT: Filter Panel -->
    <aside class="filter-panel">
      <header class="filter-header">
        <div class="filter-header__main">
          <span class="filter-header__icon">
            <el-icon><Filter /></el-icon>
          </span>
          <div class="filter-header__text">
            <h2 class="filter-title">筛选条件</h2>
            <p class="filter-subtitle">组合条件精准检索线索</p>
          </div>
        </div>
        <span v-if="activeFilterCount" class="filter-header__badge">{{ activeFilterCount }} 项生效</span>
      </header>

      <div class="filter-tabs" role="tablist" aria-label="筛选维度">
        <button
          type="button"
          role="tab"
          class="filter-tabs__btn"
          :class="{ 'is-active': filterTab === 'submission' }"
          :aria-selected="filterTab === 'submission'"
          @click="filterTab = 'submission'"
        >
          <el-icon class="filter-tabs__icon"><Upload /></el-icon>
          报送相关
          <span v-if="submissionFilterCount" class="filter-tabs__badge">{{ submissionFilterCount }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="filter-tabs__btn"
          :class="{ 'is-active': filterTab === 'audit' }"
          :aria-selected="filterTab === 'audit'"
          @click="filterTab = 'audit'"
        >
          <el-icon class="filter-tabs__icon"><Stamp /></el-icon>
          审核相关
          <span v-if="auditFilterCount" class="filter-tabs__badge">{{ auditFilterCount }}</span>
        </button>
      </div>

      <div class="filter-body">
        <!-- 报送相关 -->
        <div v-show="filterTab === 'submission'" class="filter-tab-panel">
          <section class="filter-section">
            <h3 class="filter-section__title">
              <el-icon><Grid /></el-icon>
              类别与时间
            </h3>
            <div class="filter-fields">
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><CollectionTag /></el-icon>
                  报送类别
                </label>
                <el-cascader
                  v-model="filters.riskCategory"
                  :options="tagTree"
                  :props="categoryFilterCascaderProps"
                  placeholder="报送风险类别"
                  clearable
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  effect="dark"
                  class="filter-control filter-control--category"
                  popper-class="app-tag-cascader-popper"
                />
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Calendar /></el-icon>
                  报送时间
                </label>
                <el-date-picker
                  v-model="filters.submissionDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  :editable="false"
                  clearable
                  class="filter-control filter-control--date"
                  popper-class="app-date-range-popper"
                />
              </div>
            </div>
          </section>

          <section class="filter-section">
            <h3 class="filter-section__title">
              <el-icon><User /></el-icon>
              报送人信息
            </h3>
            <div class="filter-fields">
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><User /></el-icon>
                  报送人
                </label>
                <el-input
                  v-model="filters.submitUserName"
                  placeholder="模糊匹配报送人"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </div>
              <div v-if="!deptScope" class="filter-field">
                <label class="filter-label">
                  <el-icon><OfficeBuilding /></el-icon>
                  报送部门
                </label>
                <el-input
                  v-model="filters.submitOrgName"
                  placeholder="模糊匹配报送部门"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><OfficeBuilding /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>
          </section>

          <section class="filter-section">
            <h3 class="filter-section__title">
              <el-icon><CircleCheck /></el-icon>
              报送状态
            </h3>
            <div class="filter-fields">
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><CircleCheck /></el-icon>
                  是否验证
                </label>
                <div class="filter-segment filter-segment--2" role="group" aria-label="是否验证">
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isVerify === undefined }"
                    @click="filters.isVerify = undefined"
                  >
                    <el-icon><Grid /></el-icon>
                    全部
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isVerify === 1 }"
                    @click="filters.isVerify = 1"
                  >
                    <el-icon><CircleCheck /></el-icon>
                    是
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isVerify === 0 }"
                    @click="filters.isVerify = 0"
                  >
                    <el-icon><Remove /></el-icon>
                    否
                  </button>
                </div>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Upload /></el-icon>
                  是否报送
                </label>
                <div class="filter-segment filter-segment--2" role="group" aria-label="是否报送">
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isSubmit === undefined }"
                    @click="filters.isSubmit = undefined"
                  >
                    <el-icon><Grid /></el-icon>
                    全部
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isSubmit === 1 }"
                    @click="filters.isSubmit = 1"
                  >
                    <el-icon><Upload /></el-icon>
                    是
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isSubmit === 0 }"
                    @click="filters.isSubmit = 0"
                  >
                    <el-icon><Remove /></el-icon>
                    否
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="filter-section">
            <h3 class="filter-section__title">
              <el-icon><EditPen /></el-icon>
              文本检索
            </h3>
            <div class="filter-fields">
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Monitor /></el-icon>
                  来源网站
                </label>
                <el-input
                  v-model="filters.sourceWebsite"
                  placeholder="模糊匹配来源网站"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Link /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><OfficeBuilding /></el-icon>
                  运营主体
                </label>
                <el-input
                  v-model="filters.operatingEntity"
                  placeholder="模糊匹配报送运营主体"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><OfficeBuilding /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Share /></el-icon>
                  报送渠道
                </label>
                <el-input
                  v-model="filters.submissionChannel"
                  placeholder="模糊匹配报送渠道"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Share /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Goods /></el-icon>
                  产品/组件/服务
                </label>
                <el-input
                  v-model="filters.productsComponentsServices"
                  placeholder="模糊匹配产品或服务"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><Goods /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>
          </section>
        </div>

        <!-- 审核相关 -->
        <div v-show="filterTab === 'audit'" class="filter-tab-panel">
          <section class="filter-section">
            <h3 class="filter-section__title">
              <el-icon><Flag /></el-icon>
              状态与入库
            </h3>
            <div class="filter-fields">
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Clock /></el-icon>
                  审核状态
                </label>
                <div class="filter-segment" role="group" aria-label="审核状态">
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.reviewStatus === undefined }"
                    @click="filters.reviewStatus = undefined"
                  >
                    <el-icon><Grid /></el-icon>
                    全部
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.reviewStatus === 10 }"
                    @click="filters.reviewStatus = 10"
                  >
                    <el-icon><Timer /></el-icon>
                    未审核
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.reviewStatus === 20 }"
                    @click="filters.reviewStatus = 20"
                  >
                    <el-icon><CircleCheck /></el-icon>
                    已审核
                  </button>
                </div>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Box /></el-icon>
                  是否入库
                </label>
                <div class="filter-segment filter-segment--2" role="group" aria-label="是否入库">
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isWarehouse === undefined }"
                    @click="filters.isWarehouse = undefined"
                  >
                    <el-icon><Grid /></el-icon>
                    全部
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isWarehouse === 1 }"
                    @click="filters.isWarehouse = 1"
                  >
                    <el-icon><Box /></el-icon>
                    已入库
                  </button>
                  <button
                    type="button"
                    class="filter-segment__btn"
                    :class="{ 'is-active': filters.isWarehouse === 0 }"
                    @click="filters.isWarehouse = 0"
                  >
                    <el-icon><Remove /></el-icon>
                    未入库
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="filter-section">
            <h3 class="filter-section__title">
              <el-icon><DocumentChecked /></el-icon>
              审核内容
            </h3>
            <div class="filter-fields">
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><CollectionTag /></el-icon>
                  审核类别
                </label>
                <el-cascader
                  v-model="filters.auditRiskCategory"
                  :options="tagTree"
                  :props="categoryFilterCascaderProps"
                  placeholder="审核后风险类别"
                  clearable
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  effect="dark"
                  class="filter-control filter-control--category"
                  popper-class="app-tag-cascader-popper"
                />
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><OfficeBuilding /></el-icon>
                  审核运营主体
                </label>
                <el-input
                  v-model="filters.operatingEntityHuman"
                  placeholder="模糊匹配审核运营主体"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><OfficeBuilding /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><User /></el-icon>
                  审核人
                </label>
                <el-input
                  v-model="filters.auditUserName"
                  placeholder="模糊匹配审核人姓名"
                  clearable
                  class="filter-control"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </div>
              <div class="filter-field">
                <label class="filter-label">
                  <el-icon><Calendar /></el-icon>
                  审核时间
                </label>
                <el-date-picker
                  v-model="filters.auditDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  :editable="false"
                  clearable
                  class="filter-control filter-control--date"
                  popper-class="app-date-range-popper"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer class="filter-footer">
        <button type="button" class="filter-action filter-action--primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          <span>应用筛选</span>
        </button>
        <button type="button" class="filter-action filter-action--ghost" @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </button>
      </footer>
    </aside>

    <!-- MIDDLE: Card Grid -->
    <div class="main-content">
      <header class="page-command-bar" aria-label="风险线索库概览">
        <div class="page-command-bar__intro">
          <span class="page-command-bar__icon" aria-hidden="true">
            <el-icon :size="20"><Warning /></el-icon>
          </span>
          <div class="page-command-bar__headline">
            <h1 class="page-command-bar__title">{{ pageTitle }}</h1>
            <span class="page-command-bar__sep" aria-hidden="true">·</span>
            <p class="page-command-bar__desc">{{ pageDesc }}</p>
          </div>
        </div>

        <div class="page-command-bar__stats" role="group" aria-label="线索统计">
          <button
            v-for="card in statsCards"
            :key="card.key"
            type="button"
            class="stat-pill"
            :class="[
              `stat-pill--${card.tone}`,
              {
                'is-active': card.isActive,
                'has-alert': card.key === 'pending' && stats.pending > 0,
              },
            ]"
            @click="filterByStat(card.key)"
          >
            <span class="stat-pill__icon" :style="{ background: card.iconBg }">
              <el-icon :size="14" :color="card.iconColor">
                <component :is="card.icon" />
              </el-icon>
            </span>
            <span class="stat-pill__value">{{ card.value.toLocaleString() }}</span>
            <span class="stat-pill__label">{{ card.label }}</span>
            <span
              v-if="card.key === 'pending' && stats.pending > 0"
              class="stat-pill__pulse"
              aria-hidden="true"
            />
          </button>
        </div>

        <div v-if="!sharedScope" class="page-command-bar__actions">
          <el-button
            v-if="!deptScope"
            type="warning"
            plain
            class="page-command-bar__batch-review"
            :loading="batchReviewDialogLoading"
            @click="openBatchReviewDialog"
          >
            <el-icon><DocumentChecked /></el-icon>
            批量审核
          </el-button>
          <el-button type="primary" class="page-command-bar__create" @click="createDialogVisible = true">
            <el-icon><Plus /></el-icon>
            新增线索
          </el-button>
        </div>
      </header>

      <div v-if="activeFilterChips.length" class="active-filters">
        <span class="active-filters-label">
          <el-icon><Filter /></el-icon>
          筛选
        </span>
        <el-tag
          v-for="chip in activeFilterChips"
          :key="chip.key"
          closable
          size="small"
          effect="plain"
          @close="removeFilterChip(chip.key)"
        >
          {{ chip.label }}
        </el-tag>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <div class="search-bar__shell">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索事件名称、风险描述、全文内容…"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="search-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button type="primary" class="search-btn" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>

      <!-- Card Grid -->
      <div v-loading="loading" class="card-grid-wrap">
        <div class="card-grid">
        <article
          v-for="(item, index) in clueList"
          :key="item.id"
          class="clue-card"
          :class="{
            'is-selected': currentClue?.id === item.id && drawerVisible,
            'is-pending-review': getAuditStatus(item) === 10,
          }"
          :style="{ '--card-i': index }"
          role="button"
          tabindex="0"
          @click="openDetail(item)"
          @keydown.enter.prevent="openDetail(item)"
        >
          <div
            class="card-accent"
            :class="'card-accent--' + reviewStatusClass(getAuditStatus(item))"
            aria-hidden="true"
          />
          <div class="card-body">
            <header class="card-head">
              <span class="card-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span v-if="getSourceWebsite(item)" class="card-source">
                <el-icon class="card-source__icon"><Link /></el-icon>
                {{ getSourceWebsite(item) }}
              </span>
              <span v-else class="card-source card-source--muted">
                <el-icon class="card-source__icon"><Monitor /></el-icon>
                未知来源
              </span>
              <span
                class="card-status"
                :class="'card-status--' + reviewStatusClass(getAuditStatus(item))"
              >
                <el-icon><component :is="reviewStatusIcon(getAuditStatus(item))" /></el-icon>
                {{ reviewLabel(getAuditStatus(item)) }}
              </span>
            </header>

            <div class="card-main">
              <h2 class="card-title">
                <el-icon class="card-title__icon"><Warning /></el-icon>
                {{ getEventName(item) }}
              </h2>
              <p class="card-desc">{{ getCardRiskDescription(item) }}</p>
            </div>

            <div class="card-meta-row">
              <template v-if="isCardReviewed(item)">
                <span
                  class="card-chip"
                  :class="
                    getCardWarehouse(item) === 1
                      ? 'card-chip--warehouse-yes'
                      : 'card-chip--warehouse-no'
                  "
                >
                  <el-icon><Box /></el-icon>
                  {{ getCardWarehouse(item) === 1 ? '已入库' : '未入库' }}
                </span>
                <span v-if="getCardOperatingEntity(item)" class="card-chip card-chip--entity">
                  <el-icon><OfficeBuilding /></el-icon>
                  {{ getCardOperatingEntity(item) }}
                </span>
              </template>
              <template v-else>
                <span v-if="getCardSubmissionChannel(item)" class="card-chip card-chip--channel">
                  <el-icon><Share /></el-icon>
                  {{ sourceLabel(getCardSubmissionChannel(item)) }}
                </span>
              </template>
              <span
                v-for="(label, tagIndex) in item._cardCategories || []"
                :key="`${item.id}-cat-${tagIndex}`"
                class="card-chip"
                :class="isCardReviewed(item) ? 'card-chip--category-audit' : 'card-chip--category-report'"
              >
                <el-icon><CollectionTag /></el-icon>
                {{ label }}
              </span>
              <time class="card-meta-row__time" :title="isCardReviewed(item) ? '审核时间' : '报送时间'">
                <el-icon><Clock /></el-icon>
                {{ formatCardTime(getCardDisplayTime(item)) }}
              </time>
            </div>
          </div>
        </article>
        <div v-if="!loading && clueList.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <el-icon :size="40"><FolderOpened /></el-icon>
          </div>
          <p class="empty-title">无匹配线索</p>
          <p class="empty-hint">尝试调整筛选条件或清空关键词</p>
          <el-button type="primary" plain size="small" @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            清空筛选
          </el-button>
        </div>
        </div>
      </div>

      <footer class="pagination-bar">
        <div v-if="!loading" class="pagination-bar__summary">
          <span class="pagination-bar__icon" aria-hidden="true">
            <el-icon><List /></el-icon>
          </span>
          <span class="pagination-bar__text">
            共 <strong>{{ pagination.total.toLocaleString() }}</strong> 条线索
            <template v-if="pagination.total > 0">
              · 第 <strong>{{ pagination.page }}</strong> / {{ totalPages }} 页
            </template>
          </span>
        </div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          class="clue-pagination"
          popper-class="app-pagination-popper"
          :total="pagination.total"
          :page-sizes="[12, 16, 24, 48]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </footer>
    </div>

    <!-- RIGHT: Detail Panel -->
    <div
      v-if="drawerVisible"
      class="detail-panel"
      :style="{ width: drawerWidth + 'px' }"
    >
      <div class="panel-header">
        <div class="panel-header__left">
          <span class="panel-title">
            <el-icon class="panel-title__icon"><Document /></el-icon>
            线索详情
          </span>
          <span class="panel-kbd-hint">
            <el-icon><ArrowUp /></el-icon>
            <el-icon><ArrowDown /></el-icon>
            切换 · Esc 关闭
          </span>
        </div>
        <div class="panel-header__actions">
          <button
            v-if="canEditCurrentClue(currentClue)"
            type="button"
            class="panel-edit-btn"
            @click="openEditDialog"
          >
            <el-icon><EditPen /></el-icon>
            <span>编辑</span>
          </button>
          <button
            v-if="showReviewHistoryBtn"
            type="button"
            class="panel-history-btn"
            @click.stop="openReviewHistoryDialog"
          >
            <el-icon><Clock /></el-icon>
            <span>审核历史</span>
            <span v-if="reviewHistory.length" class="panel-history-btn__badge">{{ reviewHistory.length }}</span>
          </button>
          <button
            v-if="canDeleteCurrentClue(currentClue)"
            type="button"
            class="panel-delete-btn"
            :disabled="deleteLoading"
            aria-label="删除线索"
            @click="handleDeleteClue"
          >
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </button>
          <button type="button" class="panel-close" aria-label="关闭详情" @click="closeDetailDrawer">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>
      <div
        class="panel-resize-handle"
        @mousedown="startResize"
      ></div>
      <div class="panel-content">
        <div v-if="currentClue" class="detail-content">
        <div class="detail-hero">
          <h3 class="detail-title">{{ getEventName(currentClue) }}</h3>
          <div class="detail-tags">
            <el-tag v-if="currentClue.source_website || currentClue.sourceWebsite || currentClue.siteName" type="info" size="small" effect="plain">
              {{ currentClue.source_website || currentClue.sourceWebsite || currentClue.siteName }}
            </el-tag>
            <el-tag :type="reviewTagType(getAuditStatus(currentClue))" size="small">
              {{ reviewLabel(getAuditStatus(currentClue)) }}
            </el-tag>
            <el-tag v-if="currentClue.submission_channel || currentClue.submissionChannel || currentClue.sourceType" :type="sourceTagType(currentClue.submission_channel || currentClue.submissionChannel || currentClue.sourceType)" size="small" effect="plain">
              {{ sourceLabel(currentClue.submission_channel || currentClue.submissionChannel || currentClue.sourceType || '') }}
            </el-tag>
          </div>
          <div class="detail-hero-meta">
            <span>报送 · {{ pickDisplayText(currentClue, 'submit_org_name', 'submitOrgName', 'reportUnit') }}</span>
            <span>{{ formatDateOnly(currentClue.create_time || currentClue.createTime || currentClue.createdTime) }}</span>
          </div>
        </div>

        <section class="detail-block detail-block--highlight">
          <h4 class="section-title">
            <span class="section-title__icon section-title__icon--risk"><el-icon><Warning /></el-icon></span>
            风险描述
          </h4>
          <p class="detail-prose">{{ displayText(getRiskDescription(currentClue)) }}</p>
        </section>

        <section class="detail-block">
          <h4 class="section-title">
            <span class="section-title__icon"><el-icon><Reading /></el-icon></span>
            全文内容
          </h4>
          <div class="detail-content-scroll">{{ pickDisplayText(currentClue, 'content') }}</div>
        </section>

        <section class="detail-block">
          <h4 class="section-title">
            <span class="section-title__icon"><el-icon><Link /></el-icon></span>
            来源信息
          </h4>
          <dl class="detail-dl">
            <div class="detail-dl__row">
              <dt>来源网站</dt>
              <dd>{{ pickDisplayText(currentClue, 'source_website', 'sourceWebsite', 'siteName') }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>来源 URL</dt>
              <dd>
                <a
                  v-if="pickRawText(currentClue, 'source_url', 'sourceUrl', 'url')"
                  :href="pickRawText(currentClue, 'source_url', 'sourceUrl', 'url')"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="detail-link"
                >
                  {{ pickRawText(currentClue, 'source_url', 'sourceUrl', 'url') }}
                </a>
                <template v-else>—</template>
              </dd>
            </div>
          </dl>
        </section>

        <section class="detail-block">
          <h4 class="section-title">
            <span class="section-title__icon"><el-icon><Upload /></el-icon></span>
            报送信息
          </h4>
          <div class="detail-key-grid">
            <div class="detail-key-card detail-key-card--category">
              <span class="detail-key-card__label">
                <el-icon><CollectionTag /></el-icon>
                报送类别
              </span>
              <span class="detail-key-card__value">{{ getReportCategory(currentClue) }}</span>
            </div>
            <div class="detail-key-card detail-key-card--entity">
              <span class="detail-key-card__label">
                <el-icon><OfficeBuilding /></el-icon>
                运营主体
              </span>
              <span class="detail-key-card__value">
                {{ pickDisplayText(currentClue, 'operating_entity', 'operatingEntity') }}
              </span>
            </div>
          </div>
          <dl class="detail-dl detail-dl--grid">
            <div class="detail-dl__row">
              <dt>报送时间</dt>
              <dd>{{ formatDateOnly(currentClue.submission_time || currentClue.submissionTime) }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>报送渠道</dt>
              <dd>{{ getSubmissionChannelDisplay(currentClue) }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>报送人</dt>
              <dd>{{ pickDisplayText(currentClue, 'submit_user_name', 'submitUserName') }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>是否验证</dt>
              <dd>{{ getYesNoField(currentClue, 'is_verify', 'isVerify') }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>是否报送</dt>
              <dd>{{ getYesNoField(currentClue, 'is_submit', 'isSubmit') }}</dd>
            </div>
            <div class="detail-dl__row detail-dl__row--full">
              <dt>产品/组件/服务</dt>
              <dd>{{ pickDisplayText(currentClue, 'products_components_services', 'productsComponentsServices') }}</dd>
            </div>
          </dl>
        </section>

        <ClueReportAttachments
          v-if="currentClue?.id"
          :key="attachmentPanelKey"
          :clue-id="currentClue.id"
          :initial-attachments="currentClue.report_attachments || currentClue.reportAttachments"
        />

        <section v-if="getAuditStatus(currentClue) === 20" class="detail-block detail-block--audit">
          <header class="detail-block__header">
            <h4 class="section-title">
              <span class="section-title__icon section-title__icon--audit"><el-icon><CircleCheck /></el-icon></span>
              审核结论
            </h4>
            <el-tag :type="(currentClue.is_warehouse ?? currentClue.isWarehouse) === 1 ? 'success' : 'info'" size="small" effect="plain">
              <el-icon style="margin-right: 4px"><Box /></el-icon>
              {{ (currentClue.is_warehouse ?? currentClue.isWarehouse) === 1 ? '已入库' : '未入库' }}
            </el-tag>
          </header>
          <div class="detail-key-grid">
            <div class="detail-key-card detail-key-card--category">
              <span class="detail-key-card__label">
                <el-icon><CollectionTag /></el-icon>
                风险类别
              </span>
              <span class="detail-key-card__value">{{ getHumanReportCategory(currentClue) }}</span>
            </div>
            <div class="detail-key-card detail-key-card--entity">
              <span class="detail-key-card__label">
                <el-icon><OfficeBuilding /></el-icon>
                运营主体
              </span>
              <span class="detail-key-card__value">
                {{ pickDisplayText(currentClue, 'operating_entity_human', 'operatingEntityHuman') }}
              </span>
            </div>
          </div>
          <dl class="detail-dl detail-dl--grid">
            <div class="detail-dl__row">
              <dt>审核人</dt>
              <dd>{{ pickDisplayText(currentClue, 'audit_user_name', 'auditUserName') }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>审核部门</dt>
              <dd>{{ pickDisplayText(currentClue, 'audit_dept_name', 'auditDeptName') }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>审核时间</dt>
              <dd>{{ formatDateTime(currentClue.audit_time || currentClue.auditTime) }}</dd>
            </div>
            <div class="detail-dl__row">
              <dt>入库时间</dt>
              <dd>{{ formatDateTime(currentClue.warehouse_time || currentClue.warehouseTime) }}</dd>
            </div>
            <div class="detail-dl__row detail-dl__row--full">
              <dt>风险描述</dt>
              <dd class="detail-dl__prose">{{ pickDisplayText(currentClue, 'risk_description_human', 'riskDescriptionHuman') }}</dd>
            </div>
            <div class="detail-dl__row detail-dl__row--full">
              <dt>审核备注</dt>
              <dd>{{ pickDisplayText(currentClue, 'audit_reason', 'auditReason') }}</dd>
            </div>
          </dl>
        </section>
        </div>

        <!-- Review Action -->
        <template v-if="currentClue && canReviewClue(currentClue)">
          <div
            class="detail-section review-action"
            :class="{ 'review-action--rereview': isCardReviewed(currentClue) }"
          >
            <header class="review-action__header">
              <div class="review-action__header-text">
                <h4 class="review-action__title">
                  <el-icon><EditPen /></el-icon>
                  {{ isCardReviewed(currentClue) ? '重新审核' : '审核操作' }}
                </h4>
                <p class="review-action__hint">
                  {{
                    isCardReviewed(currentClue)
                      ? '修改后将更新当前审核结论，并新增一条审核历史记录'
                      : '填写审核结论后将写入线索库并更新审核状态'
                  }}
                </p>
              </div>
              <span
                class="review-action__badge"
                :class="{ 'review-action__badge--rereview': isCardReviewed(currentClue) }"
              >
                {{ isCardReviewed(currentClue) ? '可重复审核' : '待审核' }}
              </span>
            </header>

            <el-form class="review-form" label-position="top" size="default">
              <div class="review-form__section">
                <span class="review-form__section-label">入库决策</span>
                <div class="warehouse-toggle" role="group" aria-label="是否入库">
                  <button
                    type="button"
                    class="warehouse-toggle__option"
                    :class="{ 'is-active': reviewForm.isWarehouse === 1 }"
                    @click="reviewForm.isWarehouse = 1"
                  >
                    <span class="warehouse-toggle__icon warehouse-toggle__icon--yes">
                      <el-icon><Box /></el-icon>
                    </span>
                    <span class="warehouse-toggle__text">
                      <strong>入库</strong>
                      <small>纳入风险线索库</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    class="warehouse-toggle__option"
                    :class="{ 'is-active': reviewForm.isWarehouse === 0 }"
                    @click="reviewForm.isWarehouse = 0"
                  >
                    <span class="warehouse-toggle__icon warehouse-toggle__icon--no">
                      <el-icon><Remove /></el-icon>
                    </span>
                    <span class="warehouse-toggle__text">
                      <strong>不入库</strong>
                      <small>仅记录审核结论</small>
                    </span>
                  </button>
                </div>
              </div>

              <div class="review-form__section">
                <span class="review-form__section-label">报送状态 <span class="review-form__optional">选填</span></span>
                <div class="review-form__grid">
                  <div class="review-yesno-field">
                    <span class="review-yesno-field__label">是否验证</span>
                    <div class="yesno-toggle" role="group" aria-label="是否验证">
                      <button
                        type="button"
                        class="yesno-toggle__btn"
                        :class="{ 'is-active': reviewForm.isVerify === undefined }"
                        @click="reviewForm.isVerify = undefined"
                      >
                        不设置
                      </button>
                      <button
                        type="button"
                        class="yesno-toggle__btn"
                        :class="{ 'is-active': reviewForm.isVerify === 1 }"
                        @click="reviewForm.isVerify = 1"
                      >
                        是
                      </button>
                      <button
                        type="button"
                        class="yesno-toggle__btn"
                        :class="{ 'is-active': reviewForm.isVerify === 0 }"
                        @click="reviewForm.isVerify = 0"
                      >
                        否
                      </button>
                    </div>
                  </div>
                  <div class="review-yesno-field">
                    <span class="review-yesno-field__label">是否报送</span>
                    <div class="yesno-toggle" role="group" aria-label="是否报送">
                      <button
                        type="button"
                        class="yesno-toggle__btn"
                        :class="{ 'is-active': reviewForm.isSubmit === undefined }"
                        @click="reviewForm.isSubmit = undefined"
                      >
                        不设置
                      </button>
                      <button
                        type="button"
                        class="yesno-toggle__btn"
                        :class="{ 'is-active': reviewForm.isSubmit === 1 }"
                        @click="reviewForm.isSubmit = 1"
                      >
                        是
                      </button>
                      <button
                        type="button"
                        class="yesno-toggle__btn"
                        :class="{ 'is-active': reviewForm.isSubmit === 0 }"
                        @click="reviewForm.isSubmit = 0"
                      >
                        否
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="review-form__grid">
                <el-form-item label="风险类别" required class="review-form__item">
                  <el-cascader
                    v-model="reviewForm.riskCategory"
                    :options="tagTree"
                    :props="categoryCascaderProps"
                    placeholder="请选择一级 / 二级类别"
                    clearable
                    filterable
                    effect="dark"
                    class="review-control review-control--category"
                    popper-class="app-tag-cascader-popper"
                  />
                </el-form-item>
                <el-form-item label="运营主体" class="review-form__item">
                  <el-input
                    v-model="reviewForm.operatingEntityHuman"
                    placeholder="请输入运营主体"
                    clearable
                    class="review-control"
                  />
                </el-form-item>
              </div>

              <el-form-item label="风险描述" required class="review-form__item review-form__item--full">
                <el-input
                  v-model="reviewForm.riskDescriptionHuman"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入审核后的风险描述，将覆盖人工审核字段"
                  class="review-control"
                />
              </el-form-item>

              <el-form-item label="审核备注" class="review-form__item review-form__item--full">
                <el-input
                  v-model="reviewForm.reviewComment"
                  type="textarea"
                  :rows="2"
                  placeholder="可选，补充审核说明"
                  class="review-control"
                />
              </el-form-item>

              <div class="review-form__footer">
                <el-button
                  type="primary"
                  class="review-submit-btn"
                  :loading="reviewLoading"
                  @click="handleSubmitReview"
                >
                  {{ isCardReviewed(currentClue) ? '保存并更新审核' : '提交审核' }}
                </el-button>
              </div>
            </el-form>
          </div>
        </template>
      </div>
    </div>

    <!-- Review History Dialog -->
    <el-dialog
      v-model="reviewHistoryDialogVisible"
      title="审核历史"
      width="580px"
      class="review-history-dialog"
      modal-class="review-history-dialog-overlay"
      append-to-body
      align-center
      :z-index="5000"
    >
      <div v-loading="reviewHistoryLoading" class="review-history-dialog__body">
        <div v-if="reviewHistory.length > 0" class="review-timeline">
          <div
            v-for="(record, idx) in reviewHistory"
            :key="record.id || idx"
            class="timeline-item"
            :class="{ 'timeline-item--latest': idx === 0 }"
          >
            <div class="timeline-dot dot-reviewed" />
            <div class="timeline-content">
              <dl class="timeline-meta">
                <div class="timeline-meta__row">
                  <dt>审核人</dt>
                  <dd>{{ getRecordReviewer(record) }}</dd>
                </div>
                <div class="timeline-meta__row">
                  <dt>审核部门</dt>
                  <dd>{{ getRecordDept(record) }}</dd>
                </div>
                <div class="timeline-meta__row">
                  <dt>审核时间</dt>
                  <dd>{{ formatDateTime(record.reviewTime || record.review_time) }}</dd>
                </div>
                <div class="timeline-meta__row">
                  <dt>入库时间</dt>
                  <dd>{{ formatDateTime(record.warehouseTime || record.warehouse_time) }}</dd>
                </div>
              </dl>
              <div class="timeline-result">
                <el-tag :type="getRecordWarehouse(record) === 1 ? 'success' : 'info'" size="small">
                  {{ getRecordWarehouse(record) === 1 ? '已入库' : '未入库' }}
                </el-tag>
              </div>
              <dl class="timeline-dl">
                <div class="timeline-dl__row">
                  <dt>风险类别</dt>
                  <dd>{{ getRecordCategory(record) }}</dd>
                </div>
                <div class="timeline-dl__row">
                  <dt>运营主体</dt>
                  <dd>{{ pickDisplayText(record, 'operatingEntityHuman', 'operating_entity_human') }}</dd>
                </div>
                <div class="timeline-dl__row">
                  <dt>风险描述</dt>
                  <dd>{{ pickDisplayText(record, 'riskDescriptionHuman', 'risk_description_human') }}</dd>
                </div>
                <div class="timeline-dl__row">
                  <dt>审核备注</dt>
                  <dd>{{ pickDisplayText(record, 'reviewComment', 'review_comment') }}</dd>
                </div>
                <div v-if="hasRecordYesNo(record, 'isVerify', 'is_verify')" class="timeline-dl__row">
                  <dt>是否验证</dt>
                  <dd>{{ getYesNoField(record, 'is_verify', 'isVerify') }}</dd>
                </div>
                <div v-if="hasRecordYesNo(record, 'isSubmit', 'is_submit')" class="timeline-dl__row">
                  <dt>是否报送</dt>
                  <dd>{{ getYesNoField(record, 'is_submit', 'isSubmit') }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <el-empty
          v-else-if="!reviewHistoryLoading"
          class="review-history-empty"
          description="暂无审核记录"
          :image-size="72"
        />
      </div>
    </el-dialog>

    <el-dialog
      v-model="batchReviewDialogVisible"
      width="600px"
      class="batch-review-dialog"
      modal-class="batch-review-dialog-overlay"
      append-to-body
      destroy-on-close
      align-center
      :close-on-click-modal="!batchReviewSubmitting"
      :close-on-press-escape="!batchReviewSubmitting"
      :show-close="!batchReviewSubmitting"
      @closed="resetBatchReviewDialog"
    >
      <template #header>
        <div class="batch-review-dialog__header">
          <div class="batch-review-dialog__header-main">
            <span class="batch-review-dialog__header-icon" aria-hidden="true">
              <el-icon :size="20"><DocumentChecked /></el-icon>
            </span>
            <div class="batch-review-dialog__header-text">
              <h3 class="batch-review-dialog__title">批量审核</h3>
              <p class="batch-review-dialog__subtitle">Batch Review · 高风险批量操作</p>
            </div>
          </div>
          <span class="batch-review-dialog__status-chip">
            <span class="batch-review-dialog__status-dot" aria-hidden="true" />
            IRREVERSIBLE
          </span>
        </div>
      </template>

      <div v-loading="batchReviewDialogLoading" class="batch-review-dialog__body">
        <div class="batch-review-dialog__risk-panel">
          <div class="batch-review-dialog__risk-panel-icon" aria-hidden="true">
            <el-icon :size="18"><Warning /></el-icon>
          </div>
          <div class="batch-review-dialog__risk-panel-content">
            <p class="batch-review-dialog__risk-panel-title">操作不可撤销</p>
            <p class="batch-review-dialog__risk-panel-desc">
              将一次性处理当前筛选条件下的全部未审核线索。审核完成后无法批量回退，请仔细核对筛选范围与入库决策。
            </p>
          </div>
        </div>

        <div class="batch-review-dialog__metrics">
          <div class="batch-review-dialog__metric-card">
            <span class="batch-review-dialog__metric-label">待处理线索</span>
            <strong class="batch-review-dialog__metric-value">
              {{ batchReviewPendingCount.toLocaleString() }}
            </strong>
            <span class="batch-review-dialog__metric-unit">条记录</span>
          </div>

          <div class="batch-review-dialog__mapping">
            <span class="batch-review-dialog__mapping-label">自动映射规则</span>
            <ul class="batch-review-dialog__mapping-list">
              <li>
                <span class="batch-review-dialog__mapping-from">报送类别</span>
                <span class="batch-review-dialog__mapping-arrow" aria-hidden="true">→</span>
                <span class="batch-review-dialog__mapping-to">审核类别</span>
              </li>
              <li>
                <span class="batch-review-dialog__mapping-from">风险描述</span>
                <span class="batch-review-dialog__mapping-arrow" aria-hidden="true">→</span>
                <span class="batch-review-dialog__mapping-to">审核描述</span>
              </li>
              <li>
                <span class="batch-review-dialog__mapping-from">运营主体</span>
                <span class="batch-review-dialog__mapping-arrow" aria-hidden="true">→</span>
                <span class="batch-review-dialog__mapping-to">审核主体</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="batch-review-dialog__section">
          <div class="batch-review-dialog__section-head">
            <span class="batch-review-dialog__section-label">入库决策</span>
            <span class="batch-review-dialog__section-tag">
              {{ batchReviewForm.isWarehouse === 1 ? 'WAREHOUSE ON' : 'WAREHOUSE OFF' }}
            </span>
          </div>
          <div
            class="batch-review-dialog__warehouse warehouse-toggle"
            role="group"
            aria-label="批量审核入库决策"
          >
            <button
              type="button"
              class="warehouse-toggle__option warehouse-toggle__option--yes"
              :class="{ 'is-active': batchReviewForm.isWarehouse === 1 }"
              :disabled="batchReviewSubmitting"
              @click="batchReviewForm.isWarehouse = 1"
            >
              <span class="warehouse-toggle__icon warehouse-toggle__icon--yes">
                <el-icon><Box /></el-icon>
              </span>
              <span class="warehouse-toggle__text">
                <strong>入库</strong>
                <small>纳入风险线索库</small>
              </span>
            </button>
            <button
              type="button"
              class="warehouse-toggle__option warehouse-toggle__option--no"
              :class="{ 'is-active': batchReviewForm.isWarehouse === 0 }"
              :disabled="batchReviewSubmitting"
              @click="batchReviewForm.isWarehouse = 0"
            >
              <span class="warehouse-toggle__icon warehouse-toggle__icon--no">
                <el-icon><Remove /></el-icon>
              </span>
              <span class="warehouse-toggle__text">
                <strong>不入库</strong>
                <small>仅记录审核结论</small>
              </span>
            </button>
          </div>
        </div>

        <label
          class="batch-review-dialog__confirm"
          :class="{ 'is-checked': batchReviewForm.confirmed }"
        >
          <el-checkbox v-model="batchReviewForm.confirmed" :disabled="batchReviewSubmitting">
            我已了解上述说明，确认执行批量审核（不可撤销）
          </el-checkbox>
        </label>
      </div>

      <template #footer>
        <div class="batch-review-dialog__footer">
          <el-button
            class="batch-review-dialog__cancel-btn"
            :disabled="batchReviewSubmitting"
            @click="batchReviewDialogVisible = false"
          >
            取消
          </el-button>
          <el-button
            type="danger"
            class="batch-review-dialog__submit-btn"
            :loading="batchReviewSubmitting"
            :disabled="!canSubmitBatchReview"
            @click="submitBatchReview"
          >
            <el-icon v-if="!batchReviewSubmitting"><DocumentChecked /></el-icon>
            确认批量审核
          </el-button>
        </div>
      </template>
    </el-dialog>

    <ManualClueCreateDialog
      v-if="!sharedScope"
      v-model:visible="createDialogVisible"
      mode="clue"
      :edit-via="deptScope ? 'report' : 'library'"
      @success="onManualCreateSuccess"
    />

    <ManualClueCreateDialog
      v-if="!sharedScope"
      v-model:visible="editDialogVisible"
      mode="clue"
      :edit-clue-id="editClueId"
      :edit-clue="editClueSnapshot"
      :edit-via="deptScope ? 'report' : 'library'"
      @success="onEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, onDeactivated, onBeforeUnmount, onActivated, computed, type Component } from 'vue'
import { forceDismissOverlays, resetBusinessPageShell } from '@/utils/cleanupOverlays'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Close,
  Clock,
  Search,
  Filter,
  RefreshLeft,
  Warning,
  Document,
  Link,
  OfficeBuilding,
  Box,
  Calendar,
  CollectionTag,
  User,
  Upload,
  CircleCheck,
  CircleClose,
  DataBoard,
  Timer,
  Reading,
  EditPen,
  Monitor,
  Grid,
  Stamp,
  Share,
  Goods,
  Flag,
  DocumentChecked,
  Remove,
  FolderOpened,
  ArrowUp,
  ArrowDown,
  List,
  Plus,
  Delete,
} from '@element-plus/icons-vue'
import ManualClueCreateDialog from '@/components/business/ManualClueCreateDialog.vue'
import ClueReportAttachments from '@/components/business/ClueReportAttachments.vue'
import { searchMyReports, getMyReportStats, searchSharedClues, getSharedClueStats } from '@/api/riskReport'
import {
  searchRiskClue,
  getRiskClueById,
  reviewClue,
  batchReviewClues,
  getReviewHistory,
  getTagTree,
  getRiskClueStats,
  deleteRiskClue,
  type RiskClue,
  type ReviewRecord,
  type TagCategory,
  type BatchReviewResult,
  type BatchReviewParams,
} from '@/api/riskClue'

const props = withDefaults(
  defineProps<{
    /** 仅展示当前账号所属部门的报送数据 */
    deptScope?: boolean
    /** 仅展示已共享的线索（跨部门只读浏览） */
    sharedScope?: boolean
    /** 嵌入风险报送 Tab 时使用，调整布局高度 */
    embedded?: boolean
  }>(),
  {
    deptScope: false,
    sharedScope: false,
    embedded: false,
  },
)

const pageTitle = computed(() => {
  if (props.sharedScope) return '共享线索'
  if (props.deptScope) return '我的报送'
  return '风险线索库'
})
const pageDesc = computed(() => {
  if (props.sharedScope) return '浏览各部门共享的已入库安全事件线索'
  if (props.deptScope) return '检索与管理本部门报送的 AI 安全风险线索'
  return '采集、检索与审核 AI 安全风险线索'
})

function resolveStatsFetcher() {
  if (props.deptScope) return getMyReportStats
  if (props.sharedScope) return getSharedClueStats
  return getRiskClueStats
}

function resolveSearchFetcher() {
  if (props.deptScope) return searchMyReports
  if (props.sharedScope) return searchSharedClues
  return searchRiskClue
}

const loading = ref(false)
const reviewLoading = ref(false)
const batchReviewDialogVisible = ref(false)
const batchReviewDialogLoading = ref(false)
const batchReviewSubmitting = ref(false)
const batchReviewPendingCount = ref(0)
const batchReviewForm = reactive({
  isWarehouse: 0 as 0 | 1,
  confirmed: false,
})
const deleteLoading = ref(false)
const drawerVisible = ref(false)
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editClueId = ref('')
const editClueSnapshot = ref<RiskClue | null>(null)
const attachmentPanelKey = ref(0)
const drawerWidth = ref(960)
const DRAWER_MIN = 720
const DRAWER_MAX = 1400
const clueList = ref<RiskClue[]>([])
const tagTree = ref<TagCategory[]>([])
const filterTab = ref<'submission' | 'audit'>('submission')
const stats = reactive({
  total: 0,
  pending: 0,
  reviewed: 0,
  warehoused: 0,
})

type StatCardKey = 'pending' | 'total' | 'reviewed' | 'warehoused'

const statsCards = computed(() => {
  const cards: Array<{
    key: StatCardKey
    value: number
    label: string
    icon: Component
    iconColor: string
    iconBg: string
    tone: string
    isActive: boolean
  }> = [
    {
      key: 'pending',
      value: stats.pending,
      label: '待审核',
      icon: Timer,
      iconColor: '#fbbf24',
      iconBg: 'rgba(245, 158, 11, 0.14)',
      tone: 'pending',
      isActive: filters.reviewStatus === 10,
    },
    {
      key: 'total',
      value: stats.total,
      label: '线索总数',
      icon: DataBoard,
      iconColor: '#7aa2ff',
      iconBg: 'rgba(79, 124, 255, 0.14)',
      tone: 'total',
      isActive:
        filters.reviewStatus === undefined &&
        filters.isWarehouse === undefined &&
        !hasExtraFilters.value,
    },
    {
      key: 'reviewed',
      value: stats.reviewed,
      label: '已审核',
      icon: CircleCheck,
      iconColor: '#34d399',
      iconBg: 'rgba(16, 185, 129, 0.14)',
      tone: 'reviewed',
      isActive: filters.reviewStatus === 20 && filters.isWarehouse === undefined,
    },
    {
      key: 'warehoused',
      value: stats.warehoused,
      label: '已入库',
      icon: Box,
      iconColor: '#6ee7b7',
      iconBg: 'rgba(16, 185, 129, 0.16)',
      tone: 'warehoused',
      isActive: filters.isWarehouse === 1,
    },
  ]
  return cards
})

const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

function startResize(e: MouseEvent) {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = drawerWidth.value
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

function onResize(e: MouseEvent) {
  if (!isResizing.value) return
  const deltaX = startX.value - e.clientX
  const newWidth = Math.max(DRAWER_MIN, Math.min(DRAWER_MAX, startWidth.value + deltaX))
  drawerWidth.value = newWidth
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const currentClue = ref<RiskClue | null>(null)
const reviewHistory = ref<ReviewRecord[]>([])
const reviewHistoryDialogVisible = ref(false)
const reviewHistoryLoading = ref(false)

function onManualCreateSuccess() {
  fetchStats()
  fetchData()
}

const showReviewHistoryBtn = computed(() => {
  if (!currentClue.value) return false
  return getAuditStatus(currentClue.value) === 20 || reviewHistory.value.length > 0
})

async function fetchTagTree() {
  try {
    const res = await getTagTree('risk_clue')
    tagTree.value = res || []
  } catch (error) {
    console.error('获取标签树失败:', error)
  }
}

const categoryCascaderProps = {
  value: 'label',
  label: 'label',
  children: 'children',
  checkStrictly: true,
  emitPath: true,
}

/** 筛选项：风险类别多选 */
const categoryFilterCascaderProps = {
  ...categoryCascaderProps,
  multiple: true,
}

const filters = reactive({
  keyword: '',
  riskCategory: [] as string[][],
  reviewStatus: undefined as number | undefined,
  isWarehouse: undefined as number | undefined,
  auditRiskCategory: [] as string[][],
  operatingEntityHuman: '',
  auditUserName: '',
  auditDateRange: [] as string[],
  sourceWebsite: '',
  operatingEntity: '',
  submissionChannel: '',
  productsComponentsServices: '',
  submissionDateRange: [] as string[],
  submitUserName: '',
  submitOrgName: '',
  isVerify: undefined as number | undefined,
  isSubmit: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  size: 16,
  total: 0,
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(pagination.total / pagination.size) || 1)
)

const reviewForm = reactive({
  isWarehouse: 0 as 0 | 1,
  isVerify: undefined as number | undefined,
  isSubmit: undefined as number | undefined,
  riskCategory: [] as string[],
  riskDescriptionHuman: '',
  operatingEntityHuman: '',
  reviewComment: '',
})

function parseOptionalYesNo(item: any, ...keys: string[]): number | undefined {
  if (!item) return undefined
  for (const key of keys) {
    const val = item[key]
    if (val === 0 || val === '0') return 0
    if (val === 1 || val === '1') return 1
  }
  return undefined
}

function parseCategoryPath(item: any): string[] {
  const c1 = item.class_human_1 || item.classHuman1
  const c2 = item.class_human_2 || item.classHuman2
  if (c1 && c2) return [String(c1), String(c2)]
  if (c1) return [String(c1)]
  if (isCardReviewed(item)) return []
  const r1 = item.class_report_1 || item.classReport1
  const r2 = item.class_report_2 || item.classReport2
  if (r1 && r2) return [String(r1), String(r2)]
  if (r1) return [String(r1)]
  return []
}

function resetReviewForm(item?: any) {
  const clue = item || currentClue.value
  reviewForm.isWarehouse = (clue?.is_warehouse ?? clue?.isWarehouse ?? 0) as 0 | 1
  reviewForm.isVerify = parseOptionalYesNo(clue, 'is_verify', 'isVerify')
  reviewForm.isSubmit = parseOptionalYesNo(clue, 'is_submit', 'isSubmit')
  reviewForm.riskCategory = clue ? parseCategoryPath(clue) : []
  reviewForm.riskDescriptionHuman =
    clue?.risk_description_human ||
    clue?.riskDescriptionHuman ||
    (clue ? getRiskDescription(clue) : '')
  reviewForm.operatingEntityHuman =
    clue?.operating_entity_human ||
    clue?.operatingEntityHuman ||
    clue?.operating_entity ||
    clue?.operatingEntity ||
    ''
  reviewForm.reviewComment = clue?.audit_reason || clue?.auditReason || ''
}

function displayText(value: unknown): string {
  if (value === null || value === undefined) return '—'
  const text = String(value).trim()
  return text || '—'
}

function pickRawText(item: any, ...keys: string[]): string {
  if (!item) return ''
  for (const key of keys) {
    const value = item[key]
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim()
    }
  }
  return ''
}

function pickDisplayText(item: any, ...keys: string[]): string {
  return displayText(pickRawText(item, ...keys))
}

function formatYesNo(value: unknown): string {
  if (value === 1 || value === '1') return '是'
  if (value === 0 || value === '0') return '否'
  return '—'
}

function getYesNoField(item: any, ...keys: string[]): string {
  for (const key of keys) {
    const val = item?.[key]
    if (val === 0 || val === 1 || val === '0' || val === '1') {
      return formatYesNo(val)
    }
  }
  return '—'
}

function hasRecordYesNo(record: any, ...keys: string[]): boolean {
  return parseOptionalYesNo(record, ...keys) !== undefined
}

function getSubmissionChannelDisplay(item: any): string {
  const raw = pickRawText(item, 'submission_channel', 'submissionChannel', 'sourceType')
  return raw ? sourceLabel(raw) : '—'
}

function getEventName(item: any): string {
  return pickDisplayText(item, 'event_name', 'eventName', 'title')
}

function getRiskDescription(item: any): string {
  const raw = item.risk_description || item.riskDescription || item.summary || item.content
  return formatSummary(raw)
}

function isCardReviewed(item: any): boolean {
  return getAuditStatus(item) === 20
}

/** 未审核、已审核均可提交/重复审核（我的报送 / 共享线索只读，不可审核） */
function canReviewClue(item: any): boolean {
  if (props.deptScope || props.sharedScope) return false
  const status = getAuditStatus(item)
  return status === 10 || status === 20
}

/** 未审核、已审核线索可编辑（线索库 / 我的报送；共享线索只读） */
function canEditCurrentClue(item: any): boolean {
  if (!item || props.sharedScope) return false
  const status = getAuditStatus(item)
  return status === 10 || status === 20
}

/** 未审核状态可删除；已审核、共享浏览不可删除 */
function canDeleteCurrentClue(item: any): boolean {
  if (!item || props.sharedScope) return false
  return getAuditStatus(item) === 10
}

function openEditDialog() {
  if (!currentClue.value || !canEditCurrentClue(currentClue.value)) return
  editClueId.value = currentClue.value.id
  editClueSnapshot.value = { ...currentClue.value }
  editDialogVisible.value = true
}

async function onEditSuccess(id: string) {
  editDialogVisible.value = false
  editClueId.value = ''
  editClueSnapshot.value = null
  attachmentPanelKey.value += 1
  await fetchStats()
  await fetchData()
  if (currentClue.value?.id === id) {
    try {
      const res = await getRiskClueById(id)
      currentClue.value = normalizeClueData(res as unknown as RiskClue)
    } catch {
      const updated = clueList.value.find((item) => item.id === id)
      if (updated) currentClue.value = normalizeClueData(updated)
    }
  }
}

/** 卡片风险描述：未审核用报送描述，已审核用审核描述 */
function getCardRiskDescription(item: any): string {
  if (isCardReviewed(item)) {
    const raw = item.risk_description_human || item.riskDescriptionHuman
    return displayText(formatSummary(raw))
  }
  const raw = item.risk_description || item.riskDescription || item.summary
  return displayText(formatSummary(raw))
}

function getCardDisplayTime(item: any): string | undefined {
  if (isCardReviewed(item)) {
    if (getCardWarehouse(item) === 1) {
      return item._cardTime || item.warehouse_time || item.warehouseTime || item.audit_time || item.auditTime
    }
    return item._cardTime || item.audit_time || item.auditTime
  }
  return item._cardTime || item.submission_time || item.submissionTime
}

function getCardWarehouse(item: any): number {
  const val = item.is_warehouse ?? item.isWarehouse
  return val === 1 ? 1 : 0
}

function getCardOperatingEntity(item: any): string {
  const raw = item.operating_entity_human || item.operatingEntityHuman
  return raw ? String(raw).trim() : ''
}

function getCardSubmissionChannel(item: any): string {
  return (
    item.submission_channel ||
    item.submissionChannel ||
    item.sourceType ||
    ''
  )
}

function getReportCategoryLabels(item: any): string[] {
  const seen = new Set<string>()
  const labels: string[] = []
  const push = (label: string) => {
    const text = label.trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    labels.push(text)
  }
  toTagArray(item.class_report_list || item.classReportList || item.tags).forEach(push)
  const path = buildCategoryPath(
    item.class_report_1 || item.classReport1,
    item.class_report_2 || item.classReport2
  )
  if (path) push(path)
  return labels
}

function getHumanCategoryLabels(item: any): string[] {
  const seen = new Set<string>()
  const labels: string[] = []
  const push = (label: string) => {
    const text = label.trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    labels.push(text)
  }
  toTagArray(item.class_human_list || item.classHumanList).forEach(push)
  const path = buildCategoryPath(
    item.class_human_1 || item.classHuman1,
    item.class_human_2 || item.classHuman2
  )
  if (path) push(path)
  return labels
}

function getAuditStatus(item: any): number {
  return item.audit_status ?? item.auditStatus ?? item.reviewStatus ?? 0
}

function getSourceWebsite(item: any): string {
  return item.source_website || item.sourceWebsite || item.siteName || ''
}

function reviewStatusClass(status: number): string {
  if (status === 10) return 'pending'
  if (status === 20) return 'reviewed'
  if (status === 40) return 'rejected'
  return 'default'
}

function reviewStatusIcon(status: number): Component {
  if (status === 10) return Timer
  if (status === 20) return CircleCheck
  if (status === 40) return CircleClose
  return Clock
}

type CategoryTag = { key: string; label: string; kind: 'report' | 'human' }

function pickField(item: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const val = item[key]
    if (val !== undefined && val !== null && val !== '') return val
  }
  return undefined
}

function toTagArray(raw: unknown): string[] {
  if (raw === undefined || raw === null) return []
  if (Array.isArray(raw)) {
    return raw.flatMap((v) => toTagArray(v))
  }
  const s = String(raw).trim()
  return s ? [s] : []
}

function buildCategoryPath(c1?: unknown, c2?: unknown): string {
  const a = String(c1 ?? '').trim()
  const b = String(c2 ?? '').trim()
  if (!a) return ''
  return b ? `${a}/${b}` : a
}

function getDisplayCategoryTags(item: any): CategoryTag[] {
  const seen = new Set<string>()
  const tags: CategoryTag[] = []
  const row = item as Record<string, unknown>

  const push = (label: string, kind: 'report' | 'human') => {
    const text = label.trim()
    if (!text || seen.has(text)) return
    seen.add(text)
    tags.push({ key: `${kind}-${text}`, label: text, kind })
  }

  const pushMany = (raw: unknown, kind: 'report' | 'human') => {
    toTagArray(raw).forEach((t) => push(t, kind))
  }

  // 与历史卡片一致：优先列表字段（class_report_list / classReportList）
  pushMany(
    pickField(row, 'class_report_list', 'classReportList', 'classNameModel', 'tags'),
    'report'
  )
  pushMany(pickField(row, 'class_human_list', 'classHumanList', 'classNameHuman'), 'human')

  const reportPath = buildCategoryPath(
    pickField(row, 'class_report_1', 'classReport1'),
    pickField(row, 'class_report_2', 'classReport2')
  )
  if (reportPath) push(reportPath, 'report')

  const humanPath = buildCategoryPath(
    pickField(row, 'class_human_1', 'classHuman1'),
    pickField(row, 'class_human_2', 'classHuman2')
  )
  if (humanPath) push(humanPath, 'human')

  // 兜底：扫描接口可能返回的其它字段名
  if (tags.length === 0) {
    for (const [key, val] of Object.entries(row)) {
      if (!/class|category|tag/i.test(key) || val === undefined || val === null) continue
      if (/human/i.test(key)) pushMany(val, 'human')
      else if (/report|model|tags/i.test(key)) pushMany(val, 'report')
    }
  }

  return tags
}

function getReportCategory(item: any): string {
  const path = buildCategoryPath(
    item.class_report_1 || item.classReport1,
    item.class_report_2 || item.classReport2
  )
  if (path) return path.replace('/', ' / ')
  const list = toTagArray(item.class_report_list || item.classReportList)
  return list[0]?.replace('/', ' / ') || '—'
}

function getHumanReportCategory(item: any): string {
  const path = buildCategoryPath(
    item.class_human_1 || item.classHuman1,
    item.class_human_2 || item.classHuman2
  )
  if (path) return path.replace('/', ' / ')
  const list = toTagArray(item.class_human_list || item.classHumanList)
  return list[0]?.replace('/', ' / ') || '—'
}

function getRecordWarehouse(record: ReviewRecord): number {
  const val = record.isWarehouse ?? record.is_warehouse
  return val === 1 ? 1 : 0
}

function getRecordReviewer(record: ReviewRecord): string {
  return (
    record.reviewerName ||
    record.reviewer_name ||
    record.reviewer ||
    '—'
  )
}

function getRecordDept(record: ReviewRecord): string {
  const dept = record.reviewDept || record.review_dept
  return dept ? String(dept).trim() : '—'
}

function getRecordCategory(record: ReviewRecord): string {
  const list = record.classHumanList || record.class_human_list
  if (Array.isArray(list) && list.length) {
    return list.map((item) => String(item).replace('/', ' / ')).join('、')
  }
  const path = buildCategoryPath(
    record.classHuman1 || record.class_human_1,
    record.classHuman2 || record.class_human_2
  )
  if (path) return path.replace('/', ' / ')
  const category = record.riskCategory || record.risk_category
  if (category) return String(category).replace('/', ' / ')
  if (record.reviewTags?.length) return record.reviewTags.join('、')
  return '—'
}

async function loadReviewHistory(clueId: string) {
  reviewHistoryLoading.value = true
  try {
    const res = await getReviewHistory(clueId)
    reviewHistory.value = Array.isArray(res) ? res : []
  } catch {
    reviewHistory.value = []
  } finally {
    reviewHistoryLoading.value = false
  }
}

function closeDetailDrawer() {
  reviewHistoryDialogVisible.value = false
  drawerVisible.value = false
}

async function openReviewHistoryDialog() {
  const clueId = currentClue.value?.id
  if (!clueId) return
  reviewHistoryDialogVisible.value = true
  if (!reviewHistory.value.length) {
    await loadReviewHistory(clueId)
  }
}

function normalizeClueData(item: any): any {
  const normalized = {
    ...item,
    event_name: getEventName(item),
    eventName: getEventName(item),
    title: getEventName(item),
    risk_description: getRiskDescription(item),
    riskDescription: getRiskDescription(item),
    summary: getRiskDescription(item),
  }
  const reviewed = getAuditStatus(normalized) === 20
  normalized._cardIsReviewed = reviewed
  normalized._cardCategories = reviewed
    ? getHumanCategoryLabels(normalized)
    : getReportCategoryLabels(normalized)
  normalized._cardTime = reviewed
    ? getCardWarehouse(normalized) === 1
      ? normalized.warehouse_time || normalized.warehouseTime || normalized.audit_time || normalized.auditTime
      : normalized.audit_time || normalized.auditTime
    : normalized.submission_time || normalized.submissionTime
  return normalized
}
function riskTagType(level: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
    info: 'info',
  }
  return map[level] || 'info'
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url)
    return urlObj.hostname
  } catch {
    return '信息'
  }
}

function riskLabel(level: string, url?: string, siteName?: string): string {
  if (level === 'info') {
    if (siteName) {
      return siteName
    }
    if (url) {
      return extractDomain(url)
    }
  }
  const map: Record<string, string> = { high: '高危', medium: '中危', low: '低危', info: '信息' }
  return map[level] || level
}

function reviewTagType(status?: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  if (status === 10) return 'warning'
  if (status === 20) return 'success'
  if (status === 40) return 'danger'
  return 'info'
}

function reviewLabel(status?: number): string {
  if (status === 10) return '未审核'
  if (status === 20) return '已审核'
  if (status === 40) return '已驳回'
  return '未知'
}

function sourceTagType(source?: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  return source === 'crawl' ? 'info' : 'primary'
}

function sourceLabel(source?: string): string {
  if (!source) return ''
  const map: Record<string, string> = { crawl: '开源网站', report: '报送' }
  return map[source] || source
}

function riskLevelLabel(level: string): string {
  const map: Record<string, string> = { high: '高危', medium: '中危', low: '低危', info: '信息' }
  return map[level] || level
}

function formatRiskCategoryPath(path?: string[] | string[][] | string): string {
  if (!path) return ''
  if (typeof path === 'string') return path.trim()
  if (!Array.isArray(path) || !path.length) return ''
  if (Array.isArray(path[0])) {
    return (path as string[][])
      .map((item) => item.filter(Boolean).join(' / '))
      .filter(Boolean)
      .join('、')
  }
  return (path as string[]).filter(Boolean).join(' / ')
}

function buildRiskCategoryParam(path?: string[] | string[][]): string | undefined {
  if (!path?.length) return undefined
  if (Array.isArray(path[0])) {
    const values = (path as string[][])
      .map((item) => item.filter(Boolean).join('/'))
      .filter(Boolean)
    return values.length ? values.join(',') : undefined
  }
  const value = (path as string[]).filter(Boolean).join('/')
  return value || undefined
}

const activeFilterChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  if (filters.keyword) chips.push({ key: 'keyword', label: `关键词: ${filters.keyword}` })
  if (filters.riskCategory?.length) {
    chips.push({ key: 'riskCategory', label: `报送类别: ${formatRiskCategoryPath(filters.riskCategory)}` })
  }
  if (filters.reviewStatus !== undefined) {
    chips.push({ key: 'reviewStatus', label: `审核状态: ${reviewLabel(filters.reviewStatus)}` })
  }
  if (filters.isWarehouse !== undefined) {
    chips.push({ key: 'isWarehouse', label: `入库: ${filters.isWarehouse === 1 ? '已入库' : '未入库'}` })
  }
  if (filters.auditRiskCategory?.length) {
    chips.push({
      key: 'auditRiskCategory',
      label: `审核类别: ${formatRiskCategoryPath(filters.auditRiskCategory)}`,
    })
  }
  if (filters.operatingEntityHuman) {
    chips.push({ key: 'operatingEntityHuman', label: `审核运营主体: ${filters.operatingEntityHuman}` })
  }
  if (filters.auditUserName) chips.push({ key: 'auditUserName', label: `审核人: ${filters.auditUserName}` })
  if (filters.auditDateRange?.length === 2) {
    chips.push({
      key: 'auditDateRange',
      label: `审核时间: ${filters.auditDateRange[0]} ~ ${filters.auditDateRange[1]}`,
    })
  }
  if (filters.sourceWebsite) chips.push({ key: 'sourceWebsite', label: `来源网站: ${filters.sourceWebsite}` })
  if (filters.operatingEntity) chips.push({ key: 'operatingEntity', label: `运营主体: ${filters.operatingEntity}` })
  if (filters.submissionChannel) chips.push({ key: 'submissionChannel', label: `报送渠道: ${filters.submissionChannel}` })
  if (filters.productsComponentsServices) {
    chips.push({ key: 'productsComponentsServices', label: `产品/组件/服务: ${filters.productsComponentsServices}` })
  }
  if (filters.submissionDateRange?.length === 2) {
    chips.push({
      key: 'submissionDateRange',
      label: `报送时间: ${filters.submissionDateRange[0]} ~ ${filters.submissionDateRange[1]}`,
    })
  }
  if (filters.submitUserName) chips.push({ key: 'submitUserName', label: `报送人: ${filters.submitUserName}` })
  if (filters.submitOrgName) chips.push({ key: 'submitOrgName', label: `报送部门: ${filters.submitOrgName}` })
  if (filters.isVerify !== undefined) {
    chips.push({ key: 'isVerify', label: `是否验证: ${formatYesNo(filters.isVerify)}` })
  }
  if (filters.isSubmit !== undefined) {
    chips.push({ key: 'isSubmit', label: `是否报送: ${formatYesNo(filters.isSubmit)}` })
  }
  return chips
})

const submissionFilterCount = computed(() => {
  let n = 0
  if (filters.riskCategory?.length) n++
  if (filters.sourceWebsite) n++
  if (filters.operatingEntity) n++
  if (filters.submissionChannel) n++
  if (filters.productsComponentsServices) n++
  if (filters.submissionDateRange?.length === 2) n++
  if (filters.submitUserName) n++
  if (filters.submitOrgName) n++
  if (filters.isVerify !== undefined) n++
  if (filters.isSubmit !== undefined) n++
  return n
})

const auditFilterCount = computed(() => {
  let n = 0
  if (filters.reviewStatus !== undefined) n++
  if (filters.isWarehouse !== undefined) n++
  if (filters.auditRiskCategory?.length) n++
  if (filters.operatingEntityHuman) n++
  if (filters.auditUserName) n++
  if (filters.auditDateRange?.length === 2) n++
  return n
})

const activeFilterCount = computed(() => activeFilterChips.value.length)

const hasExtraFilters = computed(() => {
  return !!(
    filters.keyword ||
    filters.riskCategory.length ||
    filters.isWarehouse !== undefined ||
    filters.auditRiskCategory.length ||
    filters.operatingEntityHuman ||
    filters.auditUserName ||
    filters.auditDateRange.length === 2 ||
    filters.sourceWebsite ||
    filters.operatingEntity ||
    filters.submissionChannel ||
    filters.productsComponentsServices ||
    filters.submissionDateRange.length === 2 ||
    filters.submitUserName ||
    filters.submitOrgName ||
    filters.isVerify !== undefined ||
    filters.isSubmit !== undefined
  )
})

function filterByStat(type: StatCardKey) {
  if (type === 'total') {
    filters.reviewStatus = undefined
    filters.isWarehouse = undefined
  } else if (type === 'pending') {
    filters.reviewStatus = 10
    filters.isWarehouse = undefined
    filterTab.value = 'audit'
  } else if (type === 'reviewed') {
    filters.reviewStatus = 20
    filters.isWarehouse = undefined
    filterTab.value = 'audit'
  } else if (type === 'warehoused') {
    filters.reviewStatus = 20
    filters.isWarehouse = 1
    filterTab.value = 'audit'
  }
  handleSearch()
}

async function fetchStats() {
  try {
    const res = await resolveStatsFetcher()()
    const data = (res ?? {}) as unknown as Record<string, unknown>
    stats.total = Number(data.total ?? 0)
    stats.pending = Number(data.pending ?? 0)
    stats.reviewed = Number(data.reviewed ?? 0)

    let warehoused = Number(data.warehoused ?? 0)
    // 兼容未重启的后端：stats 未返回 warehoused 字段时，用与列表相同的搜索条件统计
    if (data.warehoused === undefined) {
      warehoused = await countWarehousedFromSearch()
    }
    stats.warehoused = warehoused
  } catch {
    /* 统计失败不影响列表 */
  }
}

async function countWarehousedFromSearch(): Promise<number> {
  try {
    const res = await resolveSearchFetcher()({
      reviewStatus: 20,
      isWarehouse: 1,
      page: 1,
      size: 1,
    } as any)
    const data = res as Record<string, unknown>
    return Number(data.total ?? 0)
  } catch {
    return 0
  }
}

function removeFilterChip(key: string) {
  if (key === 'keyword') filters.keyword = ''
  if (key === 'riskCategory') filters.riskCategory = []
  if (key === 'reviewStatus') filters.reviewStatus = undefined
  if (key === 'isWarehouse') filters.isWarehouse = undefined
  if (key === 'auditRiskCategory') filters.auditRiskCategory = []
  if (key === 'operatingEntityHuman') filters.operatingEntityHuman = ''
  if (key === 'auditUserName') filters.auditUserName = ''
  if (key === 'auditDateRange') filters.auditDateRange = []
  if (key === 'sourceWebsite') filters.sourceWebsite = ''
  if (key === 'operatingEntity') filters.operatingEntity = ''
  if (key === 'submissionChannel') filters.submissionChannel = ''
  if (key === 'productsComponentsServices') filters.productsComponentsServices = ''
  if (key === 'submissionDateRange') filters.submissionDateRange = []
  if (key === 'submitUserName') filters.submitUserName = ''
  if (key === 'submitOrgName') filters.submitOrgName = ''
  if (key === 'isVerify') filters.isVerify = undefined
  if (key === 'isSubmit') filters.isSubmit = undefined
  if (['riskCategory', 'sourceWebsite', 'operatingEntity', 'submissionChannel', 'productsComponentsServices', 'submissionDateRange', 'submitUserName', 'submitOrgName', 'isVerify', 'isSubmit'].includes(key)) {
    filterTab.value = 'submission'
  }
  if (['reviewStatus', 'isWarehouse', 'auditRiskCategory', 'operatingEntityHuman', 'auditUserName', 'auditDateRange'].includes(key)) {
    filterTab.value = 'audit'
  }
  handleSearch()
}

function navigateClue(direction: 1 | -1) {
  if (!clueList.value.length) return
  const currentIndex = clueList.value.findIndex((c) => c.id === currentClue.value?.id)
  let nextIndex = currentIndex < 0 ? 0 : currentIndex + direction
  if (nextIndex < 0) nextIndex = clueList.value.length - 1
  if (nextIndex >= clueList.value.length) nextIndex = 0
  openDetail(clueList.value[nextIndex])
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }
  if (e.key === 'Escape' && reviewHistoryDialogVisible.value) {
    reviewHistoryDialogVisible.value = false
    return
  }
  if (e.key === 'Escape' && drawerVisible.value) {
    closeDetailDrawer()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (drawerVisible.value) navigateClue(1)
    else if (clueList.value[0]) openDetail(clueList.value[0])
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (drawerVisible.value) navigateClue(-1)
    else if (clueList.value[0]) openDetail(clueList.value[0])
  }
}

function formatSummary(raw?: string): string {
  if (!raw) return ''
  let text = String(raw).trim()
  text = text.replace(/^\s*#{1,6}\s*/g, '')
  text = text.replace(/^(摘要|summary)\s*[:：]?\s*/i, '')
  text = text.replace(/\s+/g, ' ')
  return text
}

function formatDateTime(raw?: string): string {
  if (!raw) return '—'
  let dateStr = String(raw).trim()
  dateStr = dateStr.replace('T', ' ')
  dateStr = dateStr.replace('Z', '')
  if (dateStr.includes('.')) {
    dateStr = dateStr.split('.')[0]
  }
  return dateStr
}

/** 仅显示年月日 YYYY-MM-DD */
function formatDateOnly(raw?: string): string {
  if (!raw) return '—'
  let s = String(raw).trim().replace('T', ' ').replace('Z', '')
  if (s.includes('.')) s = s.split('.')[0]
  const datePart = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return datePart || '—'
}

function formatCardTime(raw?: string): string {
  return formatDateOnly(raw)
}

function buildFilterParams(includePagination = true): Record<string, unknown> {
  const params: Record<string, unknown> = {}
  if (includePagination) {
    params.page = pagination.page
    params.size = pagination.size
  }
  if (filters.keyword) params.keyword = filters.keyword
  const riskCategory = buildRiskCategoryParam(filters.riskCategory)
  if (riskCategory) params.riskCategory = riskCategory
  if (filters.reviewStatus !== undefined) params.reviewStatus = filters.reviewStatus
  if (filters.isWarehouse !== undefined) params.isWarehouse = filters.isWarehouse
  const auditRiskCategory = buildRiskCategoryParam(filters.auditRiskCategory)
  if (auditRiskCategory) params.auditRiskCategory = auditRiskCategory
  if (filters.operatingEntityHuman) params.operatingEntityHuman = filters.operatingEntityHuman.trim()
  if (filters.auditUserName) params.auditUserName = filters.auditUserName.trim()
  if (filters.auditDateRange?.length === 2) {
    params.auditStartTime = filters.auditDateRange[0]
    params.auditEndTime = filters.auditDateRange[1]
  }
  if (filters.sourceWebsite) params.sourceWebsite = filters.sourceWebsite.trim()
  if (filters.operatingEntity) params.operatingEntity = filters.operatingEntity.trim()
  if (filters.submissionChannel) params.submissionChannel = filters.submissionChannel.trim()
  if (filters.productsComponentsServices) {
    params.productsComponentsServices = filters.productsComponentsServices.trim()
  }
  if (filters.submissionDateRange?.length === 2) {
    params.submissionStartTime = filters.submissionDateRange[0]
    params.submissionEndTime = filters.submissionDateRange[1]
  }
  if (filters.submitUserName) params.submitUserName = filters.submitUserName.trim()
  if (filters.submitOrgName) params.submitOrgName = filters.submitOrgName.trim()
  if (filters.isVerify !== undefined) params.isVerify = filters.isVerify
  if (filters.isSubmit !== undefined) params.isSubmit = filters.isSubmit
  return params
}

const canSubmitBatchReview = computed(
  () => batchReviewPendingCount.value > 0 && batchReviewForm.confirmed && !batchReviewDialogLoading.value,
)

function resetBatchReviewDialog() {
  batchReviewForm.isWarehouse = 0
  batchReviewForm.confirmed = false
  batchReviewPendingCount.value = 0
  batchReviewDialogLoading.value = false
  batchReviewSubmitting.value = false
}

async function openBatchReviewDialog() {
  batchReviewDialogVisible.value = true
  batchReviewDialogLoading.value = true
  batchReviewForm.isWarehouse = 0
  batchReviewForm.confirmed = false
  try {
    batchReviewPendingCount.value = await fetchPendingCountForBatch()
    if (batchReviewPendingCount.value <= 0) {
      ElMessage.warning('当前筛选条件下没有待审核的线索')
      batchReviewDialogVisible.value = false
    }
  } catch {
    ElMessage.error('获取待审核数量失败')
    batchReviewDialogVisible.value = false
  } finally {
    batchReviewDialogLoading.value = false
  }
}

async function submitBatchReview() {
  if (!canSubmitBatchReview.value) return

  batchReviewSubmitting.value = true
  try {
    const payload: BatchReviewParams = {
      ...(buildFilterParams(false) as Omit<BatchReviewParams, 'batchIsWarehouse'>),
      batchIsWarehouse: batchReviewForm.isWarehouse,
    }
    const result = (await batchReviewClues(payload)) as unknown as BatchReviewResult
    const total = Number(result?.total ?? batchReviewPendingCount.value ?? 0)
    const success = Number(result?.success ?? 0)
    const failed = Number(result?.failed ?? 0)
    batchReviewDialogVisible.value = false
    if (failed > 0) {
      const detail = result.failures?.length
        ? `\n部分失败：${result.failures.map((item) => `「${item.eventName}」${item.reason}`).join('；')}`
        : ''
      ElMessage.warning(
        `批量审核完成：成功 ${success} 条，失败 ${failed} 条（待审核共 ${total} 条）${detail}`,
      )
    } else {
      ElMessage.success(`批量审核完成，成功 ${success} 条（待审核共 ${total} 条）`)
    }
    drawerVisible.value = false
    currentClue.value = null
    reviewHistory.value = []
    await fetchStats()
    await fetchData()
  } catch {
    ElMessage.error('批量审核失败')
  } finally {
    batchReviewSubmitting.value = false
  }
}

async function fetchPendingCountForBatch(): Promise<number> {
  const params = buildFilterParams(false)
  params.reviewStatus = 10
  params.page = 1
  params.size = 1
  const res = await searchRiskClue(params as any)
  const data = res as any
  return Number(data?.total ?? 0)
}

async function fetchData() {
  loading.value = true
  try {
    const params = buildFilterParams(true)
    const res = await resolveSearchFetcher()(params as any)
    const data = res as any
    const rawList = data?.rows || data?.records || data?.list || data?.data || []
    clueList.value = rawList.map(normalizeClueData)
    pagination.total = data?.total || 0
  } catch {
    clueList.value = []
  } finally {
    loading.value = false
  }
}

async function handleDeleteClue() {
  if (!currentClue.value?.id) return
  if (!canDeleteCurrentClue(currentClue.value)) {
    ElMessage.warning('已审核的数据不可删除')
    return
  }
  const name = getEventName(currentClue.value)
  try {
    await ElMessageBox.confirm(
      `确认删除线索「${name}」？删除后不可恢复，可重新新增。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
      },
    )
  } catch {
    return
  }

  deleteLoading.value = true
  try {
    await deleteRiskClue(currentClue.value.id)
    ElMessage.success('删除成功')
    drawerVisible.value = false
    currentClue.value = null
    reviewHistory.value = []
    await fetchStats()
    await fetchData()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '删除失败'
    ElMessage.error(msg)
  } finally {
    deleteLoading.value = false
  }
}

async function openDetail(item: RiskClue) {
  try {
    const res = await getRiskClueById(item.id)
    currentClue.value = normalizeClueData(res as unknown as RiskClue)
  } catch {
    currentClue.value = normalizeClueData(item)
  }
  drawerVisible.value = true
  reviewHistoryDialogVisible.value = false
  reviewHistory.value = []
  resetReviewForm(currentClue.value)

  if (getAuditStatus(currentClue.value) === 20) {
    await loadReviewHistory(item.id)
  }
}

async function handleSubmitReview() {
  if (!currentClue.value) return
  const riskCategory = buildRiskCategoryParam(reviewForm.riskCategory)
  if (!riskCategory) {
    ElMessage.warning('请选择风险类别')
    return
  }
  if (!reviewForm.riskDescriptionHuman.trim()) {
    ElMessage.warning('请填写风险描述')
    return
  }
  const clueId = currentClue.value.id
  const isRereview = isCardReviewed(currentClue.value)
  reviewLoading.value = true
  try {
    await reviewClue({
      clueId,
      isWarehouse: reviewForm.isWarehouse,
      riskCategory,
      riskDescriptionHuman: reviewForm.riskDescriptionHuman.trim(),
      operatingEntityHuman: reviewForm.operatingEntityHuman.trim() || undefined,
      reviewComment: reviewForm.reviewComment.trim() || undefined,
      ...(reviewForm.isVerify !== undefined ? { isVerify: reviewForm.isVerify } : {}),
      ...(reviewForm.isSubmit !== undefined ? { isSubmit: reviewForm.isSubmit } : {}),
    })
    ElMessage.success(isRereview ? '重新审核成功' : '审核提交成功')
    await fetchData()
    await fetchStats()
    try {
      const res = await getRiskClueById(clueId)
      currentClue.value = normalizeClueData(res as unknown as RiskClue)
    } catch {
      /* 列表数据已在 fetchData 中更新 */
    }
    resetReviewForm(currentClue.value)
    await loadReviewHistory(clueId)
  } catch {
    ElMessage.error(isRereview ? '重新审核失败' : '审核提交失败')
  } finally {
    reviewLoading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  filters.keyword = ''
  filters.riskCategory = []
  filters.reviewStatus = undefined
  filters.isWarehouse = undefined
  filters.auditRiskCategory = []
  filters.operatingEntityHuman = ''
  filters.auditUserName = ''
  filters.auditDateRange = []
  filters.sourceWebsite = ''
  filters.operatingEntity = ''
  filters.submissionChannel = ''
  filters.productsComponentsServices = ''
  filters.submissionDateRange = []
  filters.submitUserName = ''
  filters.submitOrgName = ''
  filters.isVerify = undefined
  filters.isSubmit = undefined
  filterTab.value = 'submission'
  pagination.page = 1
  fetchData()
}

function resetPageState() {
  reviewHistoryDialogVisible.value = false
  resetBusinessPageShell({
    loading,
    drawerVisible,
    dialogVisible: createDialogVisible,
  })
  currentClue.value = null
  stopResize()
}

onMounted(() => {
  fetchData()
  fetchStats()
  fetchTagTree()
  document.addEventListener('keydown', handleKeydown)
})

onActivated(() => {
  forceDismissOverlays()
})

defineExpose({
  refresh() {
    fetchStats()
    fetchData()
  },
})

onDeactivated(resetPageState)
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  resetPageState()
})
</script>

<style lang="scss" scoped src="./risk-clue.scss"></style>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;

/* 审核历史弹窗挂载在 body，需非 scoped 样式 */
.review-history-dialog-overlay {
  background-color: rgba(5, 11, 20, 0.78) !important;
  backdrop-filter: blur(6px);
}

.review-history-dialog.el-dialog {
  --el-dialog-bg-color: transparent;
  --el-dialog-title-font-size: #{$font-size-md};
  --el-text-color-primary: #{$color-text-primary};
  --el-text-color-regular: #{$color-text-regular};
  --el-text-color-secondary: #{$color-text-secondary};
  --el-text-color-placeholder: #{$color-text-placeholder};
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.99), rgba(11, 18, 32, 1)) !important;
  border: 1px solid $color-border;
  border-radius: $border-radius-xl;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(79, 124, 255, 0.08) inset;
  overflow: hidden;
}

.review-history-dialog .el-dialog__header {
  margin: 0;
  padding: $spacing-4 $spacing-5;
  border-bottom: 1px solid $color-border-light;
  background: rgba(0, 0, 0, 0.2);
}

.review-history-dialog .el-dialog__title {
  font-family: $font-family-display;
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.94) !important;
  line-height: 1.4;
}

.review-history-dialog .el-dialog__headerbtn {
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
}

.review-history-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(180, 190, 210, 0.75) !important;
  font-size: 18px;
}

.review-history-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: rgba(255, 255, 255, 0.95) !important;
}

.review-history-dialog .el-dialog__body {
  padding: $spacing-4 $spacing-5 $spacing-5;
  color: $color-text-regular;
  background: transparent;
}

.review-history-dialog__body {
  min-height: 120px;
  max-height: min(68vh, 520px);
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(120, 140, 170, 0.3) transparent;
}

.review-history-dialog .review-timeline {
  position: relative;
  padding-left: 22px;
  margin: 0;
}

.review-history-dialog .review-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: linear-gradient(180deg, rgba(79, 124, 255, 0.45), rgba(79, 124, 255, 0.08));
  border-radius: 1px;
}

.review-history-dialog .timeline-item {
  position: relative;
  margin-bottom: $spacing-4;
}

.review-history-dialog .timeline-item:last-child {
  margin-bottom: 0;
}

.review-history-dialog .timeline-item--latest .timeline-content {
  border-color: rgba(79, 124, 255, 0.38);
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.1), rgba(255, 255, 255, 0.03));
  box-shadow: 0 0 0 1px rgba(79, 124, 255, 0.12);
}

.review-history-dialog .timeline-item--latest .timeline-dot {
  box-shadow: 0 0 0 3px rgba(79, 124, 255, 0.25);
}

.review-history-dialog .timeline-dot {
  position: absolute;
  left: -22px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $color-primary;
  border: 2px solid rgba(11, 18, 32, 1);
}

.review-history-dialog .timeline-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $color-border;
  border-radius: $border-radius-lg;
  padding: $spacing-3 $spacing-4;
}

.review-history-dialog .timeline-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2 $spacing-4;
  margin: 0 0 $spacing-3;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.review-history-dialog .timeline-meta__row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.review-history-dialog .timeline-meta__row:last-child {
  grid-column: 1 / -1;
}

.review-history-dialog .timeline-meta__row dt {
  margin: 0;
  font-size: 11px;
  font-family: $font-family-mono;
  letter-spacing: 0.04em;
  color: rgba(180, 190, 210, 0.5);
}

.review-history-dialog .timeline-meta__row dd {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  word-break: break-word;
}

.review-history-dialog .timeline-dl {
  margin: $spacing-2 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-history-dialog .timeline-dl__row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: $spacing-2;
  align-items: start;
}

.review-history-dialog .timeline-result {
  margin: 8px 0 4px;
}

.review-history-dialog .timeline-dl__row dt {
  color: rgba(180, 190, 210, 0.5);
}

.review-history-dialog .timeline-dl__row dd {
  color: rgba(230, 237, 247, 0.88);
}

.review-history-dialog .review-history-empty .el-empty__description {
  color: rgba(180, 190, 210, 0.55) !important;
}

.review-history-dialog .el-loading-mask {
  background-color: rgba(11, 18, 32, 0.75) !important;
}

/* 批量审核弹窗 — 暗夜科技风（挂载 body，非 scoped） */
.batch-review-dialog-overlay {
  background:
    radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79, 124, 255, 0.12), transparent 55%),
    rgba(3, 7, 14, 0.84) !important;
  backdrop-filter: blur(10px) saturate(120%);
}

.batch-review-dialog.el-dialog {
  --el-dialog-bg-color: transparent;
  --el-dialog-title-font-size: #{$font-size-md};
  --el-text-color-primary: #{$color-text-primary};
  --el-text-color-regular: #{$color-text-regular};
  --el-text-color-secondary: #{$color-text-secondary};
  --el-text-color-placeholder: #{$color-text-placeholder};
  position: relative;
  background:
    linear-gradient(165deg, rgba(16, 24, 42, 0.98) 0%, rgba(8, 14, 26, 1) 48%, rgba(6, 11, 20, 1) 100%) !important;
  border: 1px solid rgba(79, 124, 255, 0.22);
  border-radius: $border-radius-xl;
  box-shadow:
    0 28px 64px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(79, 124, 255, 0.1) inset,
    0 0 48px rgba(79, 124, 255, 0.08);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(79, 124, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(79, 124, 255, 0.04) 1px, transparent 1px);
    background-size: 24px 24px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.55), transparent 72%);
    opacity: 0.7;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(79, 124, 255, 0.55),
      rgba(16, 185, 129, 0.35),
      rgba(79, 124, 255, 0.55),
      transparent
    );
    animation: batch-review-scan 4.5s ease-in-out infinite;
  }
}

@keyframes batch-review-scan {
  0%,
  100% {
    opacity: 0.35;
    transform: scaleX(0.85);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}

.batch-review-dialog .el-dialog__header {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: $spacing-4 $spacing-5;
  border-bottom: 1px solid rgba(79, 124, 255, 0.12);
  background: linear-gradient(180deg, rgba(79, 124, 255, 0.08), rgba(0, 0, 0, 0.18));
}

.batch-review-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
}

.batch-review-dialog__header-main {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  min-width: 0;
}

.batch-review-dialog__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: $border-radius-lg;
  color: rgba(140, 180, 255, 0.95);
  background: linear-gradient(135deg, rgba(79, 124, 255, 0.22), rgba(79, 124, 255, 0.06));
  border: 1px solid rgba(79, 124, 255, 0.28);
  box-shadow: 0 0 20px rgba(79, 124, 255, 0.15);
}

.batch-review-dialog__title {
  margin: 0;
  font-family: $font-family-display;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.96);
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.batch-review-dialog__subtitle {
  margin: 2px 0 0;
  font-size: $font-size-xs;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(140, 165, 210, 0.72);
}

.batch-review-dialog__status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  height: 26px;
  padding: 0 10px;
  border-radius: $border-radius-full;
  font-size: 10px;
  font-weight: $font-weight-semibold;
  letter-spacing: 0.12em;
  color: rgba(255, 160, 120, 0.95);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.12);
}

.batch-review-dialog__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ff6b4a;
  box-shadow: 0 0 8px rgba(255, 107, 74, 0.85);
  animation: batch-review-pulse 1.8s ease-in-out infinite;
}

@keyframes batch-review-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

.batch-review-dialog .el-dialog__headerbtn {
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  z-index: 2;
}

.batch-review-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(160, 180, 210, 0.72) !important;
  font-size: 18px;
}

.batch-review-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: rgba(255, 255, 255, 0.95) !important;
}

.batch-review-dialog .el-dialog__body {
  position: relative;
  z-index: 1;
  padding: $spacing-4 $spacing-5 $spacing-5;
  color: $color-text-regular;
  background: transparent;
}

.batch-review-dialog__body {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  min-height: 120px;
}

.batch-review-dialog__risk-panel {
  display: flex;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  border-radius: $border-radius-lg;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.03));
  border: 1px solid rgba(239, 68, 68, 0.22);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.batch-review-dialog__risk-panel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: $border-radius-md;
  color: rgba(255, 150, 130, 0.95);
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.batch-review-dialog__risk-panel-title {
  margin: 0 0 4px;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: rgba(255, 190, 170, 0.96);
}

.batch-review-dialog__risk-panel-desc {
  margin: 0;
  font-size: $font-size-sm;
  line-height: 1.6;
  color: rgba(230, 200, 195, 0.78);
}

.batch-review-dialog__metrics {
  display: grid;
  grid-template-columns: 132px 1fr;
  gap: $spacing-3;
  padding: $spacing-3;
  border-radius: $border-radius-lg;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(79, 124, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.batch-review-dialog__metric-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: $spacing-3;
  border-radius: $border-radius-md;
  background: linear-gradient(160deg, rgba(79, 124, 255, 0.14), rgba(79, 124, 255, 0.04));
  border: 1px solid rgba(79, 124, 255, 0.22);
}

.batch-review-dialog__metric-label {
  font-size: $font-size-xs;
  color: rgba(160, 185, 230, 0.72);
  letter-spacing: 0.04em;
}

.batch-review-dialog__metric-value {
  font-family: $font-family-display;
  font-size: 28px;
  font-weight: $font-weight-semibold;
  line-height: 1.1;
  color: rgba(140, 190, 255, 0.98);
  text-shadow: 0 0 24px rgba(79, 124, 255, 0.35);
}

.batch-review-dialog__metric-unit {
  font-size: $font-size-xs;
  color: rgba(160, 185, 230, 0.58);
}

.batch-review-dialog__mapping-label {
  display: block;
  margin-bottom: $spacing-2;
  font-size: $font-size-xs;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(160, 185, 230, 0.65);
}

.batch-review-dialog__mapping-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.batch-review-dialog__mapping-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-xs;
}

.batch-review-dialog__mapping-from {
  padding: 2px 8px;
  border-radius: $border-radius-sm;
  color: rgba(200, 215, 240, 0.82);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.batch-review-dialog__mapping-arrow {
  color: rgba(79, 124, 255, 0.75);
  font-family: $font-family-display;
}

.batch-review-dialog__mapping-to {
  padding: 2px 8px;
  border-radius: $border-radius-sm;
  color: rgba(140, 210, 175, 0.92);
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.batch-review-dialog__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  margin-bottom: $spacing-3;
}

.batch-review-dialog__section-label {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: rgba(220, 228, 240, 0.88);
}

.batch-review-dialog__section-tag {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(140, 165, 210, 0.72);
  padding: 2px 8px;
  border-radius: $border-radius-full;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.batch-review-dialog .warehouse-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-3;
}

.batch-review-dialog .warehouse-toggle__option {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3 $spacing-4;
  border: 1px solid rgba(79, 124, 255, 0.12);
  border-radius: $border-radius-lg;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition:
    border-color $duration-base $ease-out,
    background $duration-base $ease-out,
    box-shadow $duration-base $ease-out,
    transform $duration-base $ease-out;

  &:hover:not(:disabled) {
    border-color: rgba(79, 124, 255, 0.28);
    background: rgba(255, 255, 255, 0.04);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &.is-active.warehouse-toggle__option--yes {
    border-color: rgba(16, 185, 129, 0.42);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04));
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08), 0 0 24px rgba(16, 185, 129, 0.1);
  }

  &.is-active.warehouse-toggle__option--no {
    border-color: rgba(99, 102, 241, 0.38);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04));
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
  }
}

.batch-review-dialog .warehouse-toggle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: $border-radius-md;
  font-size: 16px;

  &--yes {
    color: rgba(140, 210, 175, 0.95);
    background: rgba(16, 185, 129, 0.12);
  }

  &--no {
    color: rgba(170, 175, 230, 0.9);
    background: rgba(99, 102, 241, 0.12);
  }
}

.batch-review-dialog .warehouse-toggle__text {
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: rgba(230, 237, 247, 0.92);
  }

  small {
    font-size: $font-size-xs;
    color: rgba(160, 180, 210, 0.62);
  }
}

.batch-review-dialog__confirm {
  display: block;
  padding: $spacing-3 $spacing-4;
  border-radius: $border-radius-lg;
  background: rgba(239, 68, 68, 0.04);
  border: 1px dashed rgba(239, 68, 68, 0.22);
  cursor: pointer;
  transition:
    background $duration-base $ease-out,
    border-color $duration-base $ease-out,
    box-shadow $duration-base $ease-out;

  &:hover {
    background: rgba(239, 68, 68, 0.07);
    border-color: rgba(239, 68, 68, 0.32);
  }

  &.is-checked {
    background: rgba(239, 68, 68, 0.1);
    border-style: solid;
    border-color: rgba(239, 68, 68, 0.35);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.08);
  }

  .el-checkbox__label {
    line-height: 1.55;
    color: rgba(248, 190, 190, 0.88) !important;
    white-space: normal;
  }

  .el-checkbox__input.is-checked + .el-checkbox__label {
    color: rgba(255, 210, 210, 0.96) !important;
  }

  .el-checkbox__inner {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(239, 68, 68, 0.35);
  }

  .el-checkbox__input.is-checked .el-checkbox__inner {
    background: rgba(239, 68, 68, 0.85);
    border-color: rgba(239, 68, 68, 0.85);
  }
}

.batch-review-dialog .el-dialog__footer {
  position: relative;
  z-index: 1;
  padding: $spacing-3 $spacing-5 $spacing-5;
  border-top: 1px solid rgba(79, 124, 255, 0.1);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.28));
}

.batch-review-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-3;
}

.batch-review-dialog__cancel-btn {
  height: 36px;
  padding: 0 18px;
  border-radius: $border-radius-md;
  color: rgba(200, 210, 230, 0.82) !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;

  &:hover:not(:disabled) {
    color: rgba(230, 237, 247, 0.95) !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border-color: rgba(79, 124, 255, 0.22) !important;
  }
}

.batch-review-dialog__submit-btn {
  height: 36px;
  padding: 0 20px;
  border-radius: $border-radius-md;
  font-weight: $font-weight-semibold;
  border: 1px solid rgba(239, 68, 68, 0.45) !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.92), rgba(185, 28, 28, 0.92)) !important;
  box-shadow: 0 0 24px rgba(239, 68, 68, 0.22);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(248, 80, 80, 0.96), rgba(200, 35, 35, 0.96)) !important;
    box-shadow: 0 0 28px rgba(239, 68, 68, 0.32);
  }

  &:disabled {
    opacity: 0.45;
    box-shadow: none;
  }
}

.batch-review-dialog .el-loading-mask {
  background-color: rgba(8, 14, 26, 0.78) !important;
  backdrop-filter: blur(2px);
}

@media (max-width: 640px) {
  .batch-review-dialog__metrics {
    grid-template-columns: 1fr;
  }

  .batch-review-dialog__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .batch-review-dialog .warehouse-toggle {
    grid-template-columns: 1fr;
  }

  .batch-review-dialog__footer {
    flex-direction: column-reverse;

    .el-button {
      width: 100%;
    }
  }
}
</style>
