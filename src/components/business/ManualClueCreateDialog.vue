<template>
  <el-dialog
    :model-value="visible"
    width="760px"
    class="manual-create-dialog"
    modal-class="manual-create-dialog-overlay"
    append-to-body
    destroy-on-close
    align-center
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
    @closed="resetForm"
  >
    <template #header>
      <div class="manual-create-dialog__header">
        <div class="manual-create-dialog__header-beam" aria-hidden="true" />
        <div class="manual-create-dialog__header-inner">
          <div class="manual-create-dialog__header-icon">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="manual-create-dialog__header-text">
            <span class="manual-create-dialog__eyebrow">
              MANUAL INTAKE · {{ dialogEyebrowCode }}
            </span>
            <div class="manual-create-dialog__header-row">
              <h3 class="manual-create-dialog__title">
                {{ dialogTitle }}
              </h3>
              <span
                class="manual-create-dialog__status-pill"
                :class="statusPillClass"
              >
                <span class="manual-create-dialog__status-dot" />
                {{ statusPillText }}
              </span>
            </div>
            <p class="manual-create-dialog__subtitle">
              {{ dialogSubtitle }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="manual-create-form"
      @submit.prevent="handleSubmit"
    >
      <!-- 基本信息 -->
      <section class="manual-create-section">
        <span class="manual-create-section__accent" aria-hidden="true" />
        <header class="manual-create-section__head">
          <div class="manual-create-section__title-wrap">
            <span class="manual-create-section__index">01</span>
            <h4 class="manual-create-section__title">
              <el-icon><Document /></el-icon>
              基本信息
            </h4>
          </div>
          <span class="manual-create-section__badge manual-create-section__badge--required">REQ</span>
        </header>
        <div class="manual-create-section__body">
          <el-form-item label="事件名称" prop="eventName" required>
            <el-input
              v-model="form.eventName"
              placeholder="请输入事件名称"
              maxlength="200"
              show-word-limit
              clearable
            />
          </el-form-item>

          <el-form-item label="风险描述" prop="riskDescription" required>
            <el-input
              v-model="form.riskDescription"
              type="textarea"
              :rows="3"
              placeholder="简要描述风险情况、影响范围与关键事实"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="风险标签" class="manual-create-form__tag-item">
            <el-cascader
              v-model="form.riskTagPath"
              :options="tagTreeOptions"
              :props="riskTagCascaderProps"
              placeholder="选填，请选择一级 / 二级标签"
              clearable
              filterable
              show-all-levels
              separator=" / "
              expand-trigger="click"
              popper-class="manual-create-tag-cascader-popper"
              class="manual-create-form__full manual-create-form__tag-cascader"
            />
          </el-form-item>
        </div>
      </section>

      <!-- 来源与主体 -->
      <section class="manual-create-section">
        <span class="manual-create-section__accent" aria-hidden="true" />
        <header class="manual-create-section__head">
          <div class="manual-create-section__title-wrap">
            <span class="manual-create-section__index">02</span>
            <h4 class="manual-create-section__title">
              <el-icon><Link /></el-icon>
              来源与主体
            </h4>
          </div>
          <span class="manual-create-section__badge">OPT</span>
        </header>
        <div class="manual-create-section__body">
          <div class="manual-create-form__row">
            <el-form-item label="来源网站" class="manual-create-form__half">
              <el-input v-model="form.sourceWebsite" placeholder="如 arXiv、GitHub" clearable />
            </el-form-item>
            <el-form-item label="报送渠道" class="manual-create-form__half">
              <el-input
                v-model="form.submissionChannel"
                placeholder="如内部通报、开源监测"
                clearable
                maxlength="100"
              />
            </el-form-item>
          </div>

          <el-form-item label="来源链接">
            <el-input v-model="form.sourceUrl" placeholder="https://…" clearable>
              <template #prefix>
                <el-icon class="manual-create-form__input-icon"><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="manual-create-form__row">
            <el-form-item label="运营主体" class="manual-create-form__half">
              <el-input v-model="form.operatingEntity" placeholder="涉事企业或机构" clearable />
            </el-form-item>
            <el-form-item label="产品/组件/服务" class="manual-create-form__half">
              <el-input v-model="form.productsComponentsServices" placeholder="相关产品或服务" clearable />
            </el-form-item>
          </div>
        </div>
      </section>

      <!-- 研究与报送 -->
      <section class="manual-create-section">
        <span class="manual-create-section__accent" aria-hidden="true" />
        <header class="manual-create-section__head">
          <div class="manual-create-section__title-wrap">
            <span class="manual-create-section__index">03</span>
            <h4 class="manual-create-section__title">
              <el-icon><Reading /></el-icon>
              研究与报送
            </h4>
          </div>
          <span class="manual-create-section__badge">OPT</span>
        </header>
        <div class="manual-create-section__body">
          <div class="manual-create-form__row">
            <el-form-item label="论文名称" class="manual-create-form__half">
              <el-input v-model="form.paperTitle" placeholder="关联论文标题" clearable maxlength="300" />
            </el-form-item>
            <el-form-item label="研究团队" class="manual-create-form__half">
              <el-input v-model="form.researchTeam" placeholder="团队或作者" clearable maxlength="200" />
            </el-form-item>
          </div>

          <div v-if="!isEditMode" class="manual-create-form__row">
            <el-form-item label="报送人" class="manual-create-form__half">
              <el-input
                v-model="form.submitUserName"
                placeholder="不填默认当前登录用户"
                clearable
                maxlength="64"
                @blur="syncSubmitOrg"
              >
                <template #prefix>
                  <el-icon class="manual-create-form__input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="报送部门" class="manual-create-form__half">
              <el-input
                v-model="form.submitOrgName"
                class="manual-create-form__readonly"
                placeholder="根据报送人自动带出"
                readonly
              >
                <template #prefix>
                  <el-icon class="manual-create-form__input-icon"><OfficeBuilding /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>
          <div v-else class="manual-create-form__row">
            <el-form-item label="报送人" class="manual-create-form__half">
              <el-input
                :model-value="form.submitUserName || '—'"
                class="manual-create-form__readonly"
                readonly
              >
                <template #prefix>
                  <el-icon class="manual-create-form__input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="报送部门" class="manual-create-form__half">
              <el-input
                :model-value="form.submitOrgName || '—'"
                class="manual-create-form__readonly"
                readonly
              >
                <template #prefix>
                  <el-icon class="manual-create-form__input-icon"><OfficeBuilding /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </div>
        </div>
      </section>

      <!-- 全文内容 -->
      <section class="manual-create-section manual-create-section--last">
        <span class="manual-create-section__accent" aria-hidden="true" />
        <header class="manual-create-section__head">
          <div class="manual-create-section__title-wrap">
            <span class="manual-create-section__index">04</span>
            <h4 class="manual-create-section__title">
              <el-icon><EditPen /></el-icon>
              正文内容
            </h4>
          </div>
          <span class="manual-create-section__badge">OPT</span>
        </header>
        <div class="manual-create-section__body">
          <el-form-item label="全文内容">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="4"
              placeholder="可粘贴通报原文、摘要或补充说明"
            />
          </el-form-item>
        </div>
      </section>
    </el-form>

    <template #footer>
      <div class="manual-create-dialog__footer-beam" aria-hidden="true" />
      <div class="manual-create-dialog__footer">
        <span class="manual-create-dialog__footer-hint">
          <span class="manual-create-dialog__required-dot" aria-hidden="true" />
          <span class="manual-create-dialog__footer-code">FIELD::REQ</span>
          必填项
        </span>
        <div class="manual-create-dialog__footer-actions">
          <el-button class="manual-create-dialog__cancel-btn" @click="emit('update:visible', false)">
            取消
          </el-button>
          <el-button
            type="primary"
            class="manual-create-dialog__submit-btn"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ submitButtonText }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  Document,
  Link,
  Reading,
  User,
  OfficeBuilding,
  EditPen,
  Cpu,
} from '@element-plus/icons-vue'
import {
  createRiskClue,
  resolveSubmitOrg,
  type RiskClue,
  type RiskClueManualCreatePayload,
} from '@/api/riskClue'
import { getTagTree, type TagCategoryNode } from '@/api/tagCategory'
import { createSecurityEvent } from '@/api/securityEvent'
import { updateMyReport } from '@/api/riskReport'
import { useAuthStore } from '@/stores/auth'

const props = withDefaults(
  defineProps<{
    visible: boolean
    mode: 'clue' | 'event'
    /** 编辑模式：传入待审核报送 ID */
    editClueId?: string
    /** 编辑模式：当前线索数据，用于表单回填 */
    editClue?: RiskClue | null
  }>(),
  {
    mode: 'clue',
    editClueId: '',
    editClue: null,
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [id: string]
}>()

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const tagTree = ref<TagCategoryNode[]>([])

const riskTagCascaderProps = {
  value: 'label',
  label: 'label',
  children: 'children',
  checkStrictly: true,
  emitPath: true,
}

function filterEnabledTagTree(nodes: TagCategoryNode[]): TagCategoryNode[] {
  return nodes
    .filter((node) => node.status === '0')
    .map((node) => ({
      ...node,
      children: node.children?.length ? filterEnabledTagTree(node.children) : undefined,
    }))
}

const tagTreeOptions = computed(() => filterEnabledTagTree(tagTree.value))

const isEditMode = computed(() => Boolean(props.editClueId))

const dialogEyebrowCode = computed(() => {
  if (isEditMode.value) return 'REPORT-EDIT'
  return props.mode === 'event' ? 'SEC-EVENT' : 'RISK-CLUE'
})

const dialogTitle = computed(() => {
  if (isEditMode.value) return '编辑报送'
  return props.mode === 'event' ? '新增安全事件' : '新增风险线索'
})

const dialogSubtitle = computed(() => {
  if (isEditMode.value) return '仅未审核状态可修改基础报送信息，保存后立即生效。'
  return props.mode === 'event'
    ? '创建后自动审核入库，报送信息与审核信息保持一致。'
    : '创建后进入待审核状态，可在本库审核后入库。'
})

const statusPillClass = computed(() => {
  if (isEditMode.value) return 'is-edit'
  return props.mode === 'event' ? 'is-event' : 'is-clue'
})

const statusPillText = computed(() => {
  if (isEditMode.value) return 'EDIT MODE'
  return props.mode === 'event' ? 'AUTO WAREHOUSE' : 'PENDING REVIEW'
})

const submitButtonText = computed(() => {
  if (isEditMode.value) return '保存修改'
  return props.mode === 'event' ? '创建并入库' : '创建线索'
})

const form = reactive({
  eventName: '',
  riskDescription: '',
  content: '',
  sourceUrl: '',
  sourceWebsite: '',
  paperTitle: '',
  researchTeam: '',
  submissionChannel: '',
  operatingEntity: '',
  productsComponentsServices: '',
  riskTagPath: [] as string[],
  submitUserName: '',
  submitOrgName: '',
})

const rules: FormRules = {
  eventName: [{ required: true, message: '请填写事件名称', trigger: 'blur' }],
  riskDescription: [{ required: true, message: '请填写风险描述', trigger: 'blur' }],
}

function initSubmitMeta() {
  const u = authStore.userInfo
  if (!u) {
    form.submitUserName = ''
    form.submitOrgName = ''
    return
  }
  form.submitUserName = u.nickName || u.userName || ''
  form.submitOrgName = u.deptName || ''
}

async function syncSubmitOrg() {
  const name = form.submitUserName.trim()
  if (!name) {
    const u = authStore.userInfo
    form.submitOrgName = u?.deptName || ''
    return
  }
  try {
    const res = await resolveSubmitOrg(name)
    form.submitOrgName = res.submitOrgName || ''
  } catch {
    form.submitOrgName = ''
  }
}

function pickRawText(item: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = item[key]
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim()
    }
  }
  return ''
}

function parseReportCategoryPath(clue: RiskClue): string[] {
  const c1 = clue.class_report_1 || clue.classReport1
  const c2 = clue.class_report_2 || clue.classReport2
  if (c1 && c2) return [String(c1), String(c2)]
  if (c1) return [String(c1)]
  return []
}

function populateFormFromClue(clue: RiskClue) {
  form.eventName = pickRawText(clue as unknown as Record<string, unknown>, 'event_name', 'eventName', 'title')
  form.riskDescription = pickRawText(
    clue as unknown as Record<string, unknown>,
    'risk_description',
    'riskDescription',
    'summary',
  )
  form.content = pickRawText(clue as unknown as Record<string, unknown>, 'content')
  form.sourceUrl = pickRawText(clue as unknown as Record<string, unknown>, 'source_url', 'sourceUrl', 'url')
  form.sourceWebsite = pickRawText(
    clue as unknown as Record<string, unknown>,
    'source_website',
    'sourceWebsite',
    'siteName',
  )
  form.paperTitle = pickRawText(clue as unknown as Record<string, unknown>, 'paper_title', 'paperTitle')
  form.researchTeam = pickRawText(clue as unknown as Record<string, unknown>, 'research_team', 'researchTeam')
  form.submissionChannel = pickRawText(
    clue as unknown as Record<string, unknown>,
    'submission_channel',
    'submissionChannel',
    'sourceType',
  )
  form.operatingEntity = pickRawText(
    clue as unknown as Record<string, unknown>,
    'operating_entity',
    'operatingEntity',
  )
  form.productsComponentsServices = pickRawText(
    clue as unknown as Record<string, unknown>,
    'products_components_services',
    'productsComponentsServices',
  )
  form.riskTagPath = parseReportCategoryPath(clue)
  form.submitUserName = pickRawText(
    clue as unknown as Record<string, unknown>,
    'submit_user_name',
    'submitUserName',
  )
  form.submitOrgName = pickRawText(
    clue as unknown as Record<string, unknown>,
    'submit_org_name',
    'submitOrgName',
    'reportUnit',
  )
}

watch(
  () => props.visible,
  async (open) => {
    if (!open) return
    if (isEditMode.value && props.editClue) {
      populateFormFromClue(props.editClue)
    } else {
      initSubmitMeta()
      await syncSubmitOrg()
    }
    if (tagTree.value.length === 0) {
      try {
        tagTree.value = (await getTagTree('risk_clue')) || []
      } catch {
        tagTree.value = []
      }
    }
  },
)

function pathToRiskCategory(path?: string[]): string | undefined {
  if (!path?.length) return undefined
  const value = path.filter(Boolean).join('/')
  return value || undefined
}

function buildPayload(): RiskClueManualCreatePayload {
  const payload: RiskClueManualCreatePayload = {
    eventName: form.eventName.trim(),
    riskDescription: form.riskDescription.trim(),
    content: form.content.trim() || undefined,
    sourceUrl: form.sourceUrl.trim() || undefined,
    sourceWebsite: form.sourceWebsite.trim() || undefined,
    paperTitle: form.paperTitle.trim() || undefined,
    researchTeam: form.researchTeam.trim() || undefined,
    submissionChannel: form.submissionChannel.trim() || undefined,
    operatingEntity: form.operatingEntity.trim() || undefined,
    productsComponentsServices: form.productsComponentsServices.trim() || undefined,
    riskCategory: pathToRiskCategory(form.riskTagPath),
  }
  if (!isEditMode.value) {
    payload.submitUserName = form.submitUserName.trim() || undefined
    payload.submitOrgName = form.submitOrgName.trim() || undefined
  }
  return payload
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, {
    eventName: '',
    riskDescription: '',
    content: '',
    sourceUrl: '',
    sourceWebsite: '',
    paperTitle: '',
    researchTeam: '',
    submissionChannel: '',
    operatingEntity: '',
    productsComponentsServices: '',
    riskTagPath: [],
    submitUserName: '',
    submitOrgName: '',
  })
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (fields) {
    const firstKey = fields ? Object.keys(fields as object)[0] : undefined
    if (firstKey) {
      formRef.value.scrollToField(firstKey)
    }
    return
  }

  submitting.value = true
  try {
    const payload = buildPayload()
    if (isEditMode.value && props.editClueId) {
      await updateMyReport(props.editClueId, payload)
      ElMessage.success('报送信息已更新')
      emit('update:visible', false)
      emit('success', props.editClueId)
      return
    }
    const res =
      props.mode === 'event' ? await createSecurityEvent(payload) : await createRiskClue(payload)
    const id = (res as { id?: string })?.id
    ElMessage.success(props.mode === 'event' ? '安全事件已创建并入库' : '风险线索已创建')
    emit('update:visible', false)
    emit('success', id || '')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : isEditMode.value ? '保存失败' : '创建失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables.scss' as *;

.manual-create-form__full {
  width: 100%;
}

.manual-create-form__tag-item {
  :deep(.el-form-item__content) {
    width: 100%;
  }
}

.manual-create-form__tag-cascader {
  width: 100%;

  :deep(.el-input__wrapper) {
    min-height: 36px;
    background: rgba(0, 0, 0, 0.42) !important;
    box-shadow:
      inset 0 0 0 1px rgba(79, 124, 255, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.03) !important;
  }

  :deep(.el-input__inner) {
    line-height: 1.4;
  }

  :deep(.el-input__wrapper:hover) {
    box-shadow:
      inset 0 0 0 1px rgba(79, 124, 255, 0.28),
      0 0 16px rgba(79, 124, 255, 0.08) !important;
  }

  :deep(.el-input.is-focus .el-input__wrapper) {
    background: rgba(0, 0, 0, 0.5) !important;
    box-shadow:
      inset 0 0 0 1px rgba(79, 124, 255, 0.55),
      0 0 24px rgba(79, 124, 255, 0.16),
      0 0 0 3px rgba(79, 124, 255, 0.08) !important;
  }
}

.manual-create-form__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-4;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

.manual-create-form__half {
  min-width: 0;
}

.manual-create-form__input-icon {
  color: rgba(120, 180, 255, 0.65);
  filter: drop-shadow(0 0 6px rgba(79, 124, 255, 0.35));
}

.manual-create-section {
  position: relative;
  padding: $spacing-4 $spacing-4 $spacing-4 calc(#{$spacing-4} + 8px);
  border-radius: $border-radius-lg;
  border: 1px solid rgba(79, 124, 255, 0.14);
  background:
    linear-gradient(135deg, rgba(10, 18, 36, 0.92) 0%, rgba(5, 10, 22, 0.96) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 8px 24px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  animation: manualCreateSectionIn 0.45s $ease-out both;
  transition:
    border-color $duration-base $ease-out,
    box-shadow $duration-base $ease-out;

  @for $i from 1 through 4 {
    &:nth-of-type(#{$i}) {
      animation-delay: #{0.06 + ($i - 1) * 0.05}s;
    }
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 100% 0%, rgba(79, 124, 255, 0.06), transparent 55%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(79, 124, 255, 0.018) 2px,
        rgba(79, 124, 255, 0.018) 3px
      );
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 10px;
    height: 10px;
    border-top: 1px solid rgba(255, 185, 80, 0.35);
    border-right: 1px solid rgba(255, 185, 80, 0.35);
    pointer-events: none;
    opacity: 0.7;
  }

  &:hover {
    border-color: rgba(255, 185, 80, 0.22);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 0 0 1px rgba(79, 124, 255, 0.08),
      0 12px 32px rgba(0, 0, 0, 0.28);
  }

  & + & {
    margin-top: $spacing-4;
  }

  &--last {
    margin-bottom: $spacing-1;
  }
}

.manual-create-section__accent {
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(
    180deg,
    rgba(255, 185, 80, 0.95) 0%,
    rgba(79, 124, 255, 0.75) 55%,
    rgba(79, 124, 255, 0.2) 100%
  );
  box-shadow: 0 0 16px rgba(79, 124, 255, 0.35);
}

.manual-create-section__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  margin-bottom: $spacing-4;
  padding-bottom: $spacing-3;
  border-bottom: 1px solid rgba(79, 124, 255, 0.1);

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 72px;
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 185, 80, 0.65), transparent);
  }
}

.manual-create-section__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.manual-create-section__index {
  flex-shrink: 0;
  font-family: $font-family-mono;
  font-size: 11px;
  font-weight: $font-weight-medium;
  letter-spacing: 0.12em;
  color: rgba(255, 185, 80, 0.75);
  text-shadow: 0 0 12px rgba(255, 185, 80, 0.25);
}

.manual-create-section__title {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  font-family: $font-family-display;
  color: rgba(240, 246, 255, 0.92);
  letter-spacing: 0.04em;

  .el-icon {
    font-size: 15px;
    color: rgba(140, 180, 255, 0.85);
    filter: drop-shadow(0 0 8px rgba(79, 124, 255, 0.35));
  }
}

.manual-create-section__badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: $border-radius-sm;
  font-size: 10px;
  font-family: $font-family-mono;
  font-weight: $font-weight-medium;
  letter-spacing: 0.14em;
  color: rgba(160, 190, 230, 0.72);
  background: rgba(79, 124, 255, 0.08);
  border: 1px solid rgba(79, 124, 255, 0.18);
  box-shadow: inset 0 0 12px rgba(79, 124, 255, 0.06);

  &--required {
    color: rgba(255, 200, 120, 0.95);
    background: rgba(255, 185, 80, 0.1);
    border-color: rgba(255, 185, 80, 0.28);
    box-shadow:
      inset 0 0 12px rgba(255, 185, 80, 0.08),
      0 0 14px rgba(255, 185, 80, 0.12);
  }
}

.manual-create-section__body {
  position: relative;
  z-index: 1;

  :deep(.el-form-item) {
    margin-bottom: $spacing-4;
  }

  :deep(.el-form-item:last-child) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    margin-bottom: 7px;
    padding: 0;
    line-height: 1.4;
    font-size: 11px;
    font-family: $font-family-mono;
    font-weight: $font-weight-medium;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(170, 190, 220, 0.72);
  }

  :deep(.el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label::before) {
    color: rgba(255, 185, 80, 0.9);
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    background: rgba(0, 0, 0, 0.42) !important;
    border-radius: $border-radius-md;
    box-shadow:
      inset 0 0 0 1px rgba(79, 124, 255, 0.14),
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      inset 0 -12px 24px rgba(0, 0, 0, 0.18) !important;
    transition:
      box-shadow $duration-base $ease-out,
      background $duration-base $ease-out;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    color: rgba(235, 242, 255, 0.92);
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-textarea__inner:hover) {
    box-shadow:
      inset 0 0 0 1px rgba(79, 124, 255, 0.28),
      0 0 16px rgba(79, 124, 255, 0.08) !important;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-textarea__inner:focus) {
    background: rgba(0, 0, 0, 0.5) !important;
    box-shadow:
      inset 0 0 0 1px rgba(255, 185, 80, 0.35),
      inset 0 0 0 1px rgba(79, 124, 255, 0.55),
      0 0 28px rgba(79, 124, 255, 0.2),
      0 0 12px rgba(255, 185, 80, 0.08),
      0 0 0 3px rgba(79, 124, 255, 0.08) !important;
  }

  :deep(.el-input__count) {
    font-family: $font-family-mono;
    font-size: 10px;
    color: rgba(140, 160, 190, 0.55);
  }
}

.manual-create-form__readonly {
  :deep(.el-input__wrapper) {
    background: rgba(79, 124, 255, 0.04) !important;
    box-shadow:
      inset 0 0 0 1px rgba(79, 124, 255, 0.1),
      inset 0 0 20px rgba(79, 124, 255, 0.04) !important;
  }

  :deep(.el-input__inner) {
    cursor: default;
    color: rgba(180, 200, 230, 0.78);
  }
}
</style>

<style lang="scss">
@use '@/assets/styles/variables.scss' as *;

@keyframes manualCreateDialogIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes manualCreateSectionIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes manualCreateBeamPulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

@keyframes manualCreateIconPulse {
  0%,
  100% {
    box-shadow:
      inset 0 0 20px rgba(79, 124, 255, 0.12),
      0 0 24px rgba(79, 124, 255, 0.18);
  }

  50% {
    box-shadow:
      inset 0 0 24px rgba(79, 124, 255, 0.18),
      0 0 32px rgba(79, 124, 255, 0.28),
      0 0 12px rgba(255, 185, 80, 0.12);
  }
}

.manual-create-dialog-overlay {
  background:
    radial-gradient(ellipse 55% 45% at 50% 35%, rgba(30, 48, 90, 0.42), transparent 62%),
    radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.55) 100%),
    rgba(2, 6, 14, 0.9) !important;
  backdrop-filter: blur(12px) saturate(130%);
}

.manual-create-dialog.el-dialog {
  --el-dialog-bg-color: transparent;
  --el-dialog-title-font-size: #{$font-size-md};
  --el-text-color-primary: #{$color-text-primary};
  --el-text-color-regular: #{$color-text-regular};
  --el-text-color-secondary: #{$color-text-secondary};
  --el-text-color-placeholder: #{$color-text-placeholder};
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(ellipse 90% 60% at 100% 0%, rgba(79, 124, 255, 0.12), transparent 50%),
    radial-gradient(ellipse 70% 50% at 0% 100%, rgba(255, 185, 80, 0.06), transparent 45%),
    linear-gradient(180deg, rgba(6, 12, 24, 0.99) 0%, rgba(3, 7, 16, 1) 100%) !important;
  border: 1px solid rgba(79, 124, 255, 0.22);
  border-radius: $border-radius-xl;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 0 0 1px rgba(255, 185, 80, 0.05),
    0 0 80px rgba(79, 124, 255, 0.14),
    0 40px 80px rgba(0, 0, 0, 0.72);
  overflow: hidden;
  animation: manualCreateDialogIn 0.38s $ease-out;
}

.manual-create-dialog.el-dialog::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(79, 124, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(79, 124, 255, 0.035) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 20%, #000 20%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}

.manual-create-dialog.el-dialog::after {
  content: '';
  position: absolute;
  inset: 10px;
  pointer-events: none;
  z-index: 2;
  border-radius: calc(#{$border-radius-xl} - 6px);
  background:
    linear-gradient(rgba(255, 185, 80, 0.55), rgba(255, 185, 80, 0.55)) left top / 16px 1px no-repeat,
    linear-gradient(rgba(255, 185, 80, 0.55), rgba(255, 185, 80, 0.55)) left top / 1px 16px no-repeat,
    linear-gradient(rgba(79, 124, 255, 0.55), rgba(79, 124, 255, 0.55)) right top / 16px 1px no-repeat,
    linear-gradient(rgba(79, 124, 255, 0.55), rgba(79, 124, 255, 0.55)) right top / 1px 16px no-repeat,
    linear-gradient(rgba(79, 124, 255, 0.45), rgba(79, 124, 255, 0.45)) left bottom / 16px 1px no-repeat,
    linear-gradient(rgba(79, 124, 255, 0.45), rgba(79, 124, 255, 0.45)) left bottom / 1px 16px no-repeat,
    linear-gradient(rgba(255, 185, 80, 0.45), rgba(255, 185, 80, 0.45)) right bottom / 16px 1px no-repeat,
    linear-gradient(rgba(255, 185, 80, 0.45), rgba(255, 185, 80, 0.45)) right bottom / 1px 16px no-repeat;
  opacity: 0.75;
  filter: drop-shadow(0 0 8px rgba(79, 124, 255, 0.15));
}

.manual-create-dialog .el-dialog__header {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: $spacing-5 $spacing-5 $spacing-4;
  border-bottom: 1px solid rgba(79, 124, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0.28) 100%);

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 10px;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 185, 80, 0.42);
    pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(255, 185, 80, 0.2));
  }

  &::before {
    left: 10px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    right: 52px;
    border-left: none;
    border-bottom: none;
  }
}

.manual-create-dialog__header-beam {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 185, 80, 0.55) 20%,
    rgba(79, 124, 255, 0.75) 50%,
    rgba(255, 185, 80, 0.45) 80%,
    transparent
  );
  animation: manualCreateBeamPulse 3s ease-in-out infinite;
}

.manual-create-dialog__header-inner {
  display: flex;
  align-items: flex-start;
  gap: $spacing-4;
}

.manual-create-dialog__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: $border-radius-md;
  background:
    linear-gradient(135deg, rgba(79, 124, 255, 0.22) 0%, rgba(79, 124, 255, 0.08) 100%);
  border: 1px solid rgba(120, 160, 255, 0.35);
  animation: manualCreateIconPulse 3.5s ease-in-out infinite;
  color: rgba(180, 210, 255, 0.95);
  font-size: 20px;
}

.manual-create-dialog__header-text {
  min-width: 0;
  flex: 1;
}

.manual-create-dialog__eyebrow {
  display: block;
  margin-bottom: 6px;
  font-family: $font-family-mono;
  font-size: 10px;
  font-weight: $font-weight-medium;
  letter-spacing: 0.16em;
  color: rgba(255, 185, 80, 0.72);
  text-shadow: 0 0 16px rgba(255, 185, 80, 0.15);
}

.manual-create-dialog .el-dialog__headerbtn {
  top: 18px;
  right: 18px;
  width: 34px;
  height: 34px;
  border-radius: $border-radius-sm;
  border: 1px solid rgba(79, 124, 255, 0.15);
  background: rgba(0, 0, 0, 0.25);
  transition:
    border-color $duration-base $ease-out,
    background $duration-base $ease-out,
    box-shadow $duration-base $ease-out;
}

.manual-create-dialog .el-dialog__headerbtn:hover {
  border-color: rgba(255, 185, 80, 0.35);
  background: rgba(255, 185, 80, 0.08);
  box-shadow: 0 0 16px rgba(255, 185, 80, 0.12);
}

.manual-create-dialog .el-dialog__headerbtn .el-dialog__close {
  color: rgba(180, 200, 230, 0.78) !important;
  font-size: 16px;
}

.manual-create-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: rgba(255, 255, 255, 0.95) !important;
}

.manual-create-dialog__header-row {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.manual-create-dialog__title {
  margin: 0;
  font-family: $font-family-display;
  font-size: $font-size-xl;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.96);
  line-height: 1.3;
  letter-spacing: 0.01em;
  text-shadow: 0 0 30px rgba(79, 124, 255, 0.15);
}

.manual-create-dialog__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px 4px 8px;
  border-radius: $border-radius-full;
  font-family: $font-family-mono;
  font-size: 10px;
  font-weight: $font-weight-medium;
  letter-spacing: 0.1em;
  border: 1px solid transparent;

  &.is-clue {
    color: rgba(255, 200, 120, 0.95);
    background: rgba(255, 185, 80, 0.1);
    border-color: rgba(255, 185, 80, 0.28);
    box-shadow: 0 0 18px rgba(255, 185, 80, 0.1);
  }

  &.is-event {
    color: rgba(120, 240, 190, 0.95);
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.28);
    box-shadow: 0 0 18px rgba(16, 185, 129, 0.1);
  }

  &.is-edit {
    color: rgba(140, 190, 255, 0.95);
    background: rgba(79, 124, 255, 0.1);
    border-color: rgba(79, 124, 255, 0.28);
    box-shadow: 0 0 18px rgba(79, 124, 255, 0.1);
  }
}

.manual-create-dialog__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}

.manual-create-dialog__subtitle {
  margin: $spacing-2 0 0;
  font-size: $font-size-sm;
  line-height: 1.6;
  color: rgba(160, 180, 210, 0.72);
}

.manual-create-dialog .el-dialog__body {
  position: relative;
  z-index: 1;
  padding: $spacing-5;
  max-height: min(66vh, 620px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 124, 255, 0.35) transparent;

  &::before {
    content: '';
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    display: block;
    height: 1px;
    margin-bottom: -1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(79, 124, 255, 0.35) 30%,
      rgba(255, 185, 80, 0.25) 70%,
      transparent
    );
    pointer-events: none;
    z-index: 2;
  }
}

.manual-create-dialog .el-dialog__body::-webkit-scrollbar {
  width: 6px;
}

.manual-create-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(79, 124, 255, 0.45), rgba(255, 185, 80, 0.25));
}

.manual-create-dialog .el-dialog__footer {
  position: relative;
  z-index: 1;
  margin: 0;
  padding: $spacing-4 $spacing-5;
  border-top: 1px solid rgba(79, 124, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.55) 100%);

  &::before,
  &::after {
    content: '';
    position: absolute;
    bottom: 10px;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(79, 124, 255, 0.38);
    pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(79, 124, 255, 0.2));
  }

  &::before {
    left: 10px;
    border-right: none;
    border-top: none;
  }

  &::after {
    right: 10px;
    border-left: none;
    border-top: none;
  }
}

.manual-create-dialog__footer-beam {
  position: absolute;
  top: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(79, 124, 255, 0.5) 30%,
    rgba(255, 185, 80, 0.45) 70%,
    transparent
  );
}

.manual-create-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  flex-wrap: wrap;
}

.manual-create-dialog__footer-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: $font-size-xs;
  color: rgba(150, 170, 200, 0.62);
}

.manual-create-dialog__footer-code {
  font-family: $font-family-mono;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: rgba(255, 185, 80, 0.65);
}

.manual-create-dialog__required-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 185, 80, 0.95);
  box-shadow: 0 0 10px rgba(255, 185, 80, 0.55);
}

.manual-create-dialog__footer-actions {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin-left: auto;
}

.manual-create-dialog__cancel-btn {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(79, 124, 255, 0.18) !important;
  color: rgba(190, 205, 230, 0.85) !important;
  transition:
    border-color $duration-base $ease-out,
    background $duration-base $ease-out,
    box-shadow $duration-base $ease-out;

  &:hover {
    background: rgba(79, 124, 255, 0.08) !important;
    border-color: rgba(79, 124, 255, 0.32) !important;
    color: rgba(255, 255, 255, 0.92) !important;
    box-shadow: 0 0 20px rgba(79, 124, 255, 0.1);
  }
}

.manual-create-dialog__submit-btn {
  background: linear-gradient(135deg, #5b84ff 0%, #3d67e6 55%, #2f55c9 100%) !important;
  border: 1px solid rgba(140, 175, 255, 0.45) !important;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 24px rgba(79, 124, 255, 0.28) !important;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
  transition:
    transform $duration-base $ease-out,
    box-shadow $duration-base $ease-out,
    filter $duration-base $ease-out;

  &:hover:not(.is-disabled) {
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 0 32px rgba(79, 124, 255, 0.42) !important;
    filter: brightness(1.05);
  }

  &:active:not(.is-disabled) {
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .manual-create-dialog.el-dialog {
    width: calc(100vw - 20px) !important;
    margin: 10px auto;
  }

  .manual-create-dialog__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .manual-create-dialog__footer-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .manual-create-dialog.el-dialog,
  .manual-create-section,
  .manual-create-dialog__header-beam,
  .manual-create-dialog__header-icon {
    animation: none;
    transition: none;
  }

  .manual-create-dialog__submit-btn:hover:not(.is-disabled) {
    transform: none;
  }
}

.manual-create-tag-cascader-popper.el-popper {
  background: linear-gradient(180deg, rgba(6, 12, 24, 0.98), rgba(3, 7, 16, 0.99)) !important;
  border: 1px solid rgba(79, 124, 255, 0.22) !important;
  box-shadow:
    0 0 40px rgba(79, 124, 255, 0.12),
    0 16px 48px rgba(0, 0, 0, 0.55) !important;

  .el-popper__arrow::before {
    background: rgba(6, 12, 24, 0.98) !important;
    border-color: rgba(79, 124, 255, 0.22) !important;
  }

  .el-cascader-panel {
    border: none;
  }

  .el-cascader-menu {
    min-width: 200px;
    border-right-color: rgba(79, 124, 255, 0.12);
    color: rgba(220, 230, 250, 0.88);
  }

  .el-cascader-menu:last-child {
    border-right: none;
  }

  .el-cascader-node {
    color: rgba(200, 215, 240, 0.82);

    &:hover,
    &:focus {
      background: rgba(79, 124, 255, 0.12);
    }

    &.is-active {
      color: rgba(255, 200, 120, 0.95);
      font-weight: $font-weight-medium;
    }

    &.in-active-path {
      color: rgba(180, 210, 255, 0.95);
      background: rgba(79, 124, 255, 0.08);
    }
  }

  .el-cascader-node__label {
    white-space: normal;
    word-break: break-word;
    line-height: 1.45;
  }
}
</style>
