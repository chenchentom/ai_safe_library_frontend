<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'event' ? '新增安全事件' : '新增风险线索'"
    width="640px"
    class="manual-create-dialog"
    append-to-body
    destroy-on-close
    align-center
    @update:model-value="emit('update:visible', $event)"
    @closed="resetForm"
  >
    <p class="manual-create-dialog__hint">
      {{
        mode === 'event'
          ? '创建后自动审核入库，报送信息与审核信息保持一致。'
          : '创建后进入待审核状态，可在本库审核后入库。'
      }}
    </p>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="manual-create-form"
      @submit.prevent
    >
      <el-form-item label="事件名称" prop="eventName">
        <el-input v-model="form.eventName" placeholder="请输入事件名称" maxlength="200" show-word-limit />
      </el-form-item>

      <el-form-item label="风险描述" prop="riskDescription">
        <el-input
          v-model="form.riskDescription"
          type="textarea"
          :rows="3"
          placeholder="简要描述风险情况"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="报送类别">
        <el-cascader
          v-model="form.riskCategoryPath"
          :options="tagTree"
          :props="cascaderProps"
          placeholder="选填，一级/二级类别"
          clearable
          filterable
          class="manual-create-form__full"
        />
      </el-form-item>

      <div class="manual-create-form__row">
        <el-form-item label="论文名称" class="manual-create-form__half">
          <el-input v-model="form.paperTitle" placeholder="选填" clearable maxlength="300" />
        </el-form-item>
        <el-form-item label="研究团队" class="manual-create-form__half">
          <el-input v-model="form.researchTeam" placeholder="选填" clearable maxlength="200" />
        </el-form-item>
      </div>

      <div class="manual-create-form__row">
        <el-form-item label="来源网站" class="manual-create-form__half">
          <el-input v-model="form.sourceWebsite" placeholder="选填" clearable />
        </el-form-item>
        <el-form-item label="报送渠道" class="manual-create-form__half">
          <el-input v-model="form.submissionChannel" placeholder="请输入报送渠道" clearable maxlength="100" />
        </el-form-item>
      </div>

      <el-form-item label="来源链接">
        <el-input v-model="form.sourceUrl" placeholder="选填，http(s)://…" clearable />
      </el-form-item>

      <div class="manual-create-form__row">
        <el-form-item label="运营主体" class="manual-create-form__half">
          <el-input v-model="form.operatingEntity" placeholder="选填" clearable />
        </el-form-item>
        <el-form-item label="产品/组件/服务" class="manual-create-form__half">
          <el-input v-model="form.productsComponentsServices" placeholder="选填" clearable />
        </el-form-item>
      </div>

      <el-form-item label="全文内容">
        <el-input v-model="form.content" type="textarea" :rows="2" placeholder="选填" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ mode === 'event' ? '创建并入库' : '创建线索' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  createRiskClue,
  getTagTree,
  type RiskClueManualCreatePayload,
  type TagCategory,
} from '@/api/riskClue'
import { createSecurityEvent } from '@/api/securityEvent'

const props = withDefaults(
  defineProps<{
    visible: boolean
    mode: 'clue' | 'event'
  }>(),
  { mode: 'clue' },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [id: string]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const tagTree = ref<TagCategory[]>([])

const cascaderProps = {
  value: 'label',
  label: 'label',
  children: 'children',
  checkStrictly: true,
}

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
  riskCategoryPath: [] as string[],
})

const rules: FormRules = {
  eventName: [{ required: true, message: '请填写事件名称', trigger: 'blur' }],
  riskDescription: [{ required: true, message: '请填写风险描述', trigger: 'blur' }],
}

watch(
  () => props.visible,
  async (open) => {
    if (!open) return
    if (tagTree.value.length === 0) {
      try {
        tagTree.value = (await getTagTree('risk_clue')) || []
      } catch {
        tagTree.value = []
      }
    }
  },
)

function pathToCategory(path: string[]): string | undefined {
  if (!path || path.length === 0) return undefined
  return path.filter(Boolean).join('/')
}

function buildPayload(): RiskClueManualCreatePayload {
  return {
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
    riskCategory: pathToCategory(form.riskCategoryPath),
  }
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
    riskCategoryPath: [],
  })
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = buildPayload()
    const res =
      props.mode === 'event' ? await createSecurityEvent(payload) : await createRiskClue(payload)
    const id = (res as { id?: string })?.id
    ElMessage.success(props.mode === 'event' ? '安全事件已创建并入库' : '风险线索已创建')
    emit('update:visible', false)
    emit('success', id || '')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '创建失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.manual-create-dialog__hint {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.manual-create-form__full {
  width: 100%;
}

.manual-create-form__row {
  display: flex;
  gap: 16px;
}

.manual-create-form__half {
  flex: 1;
  min-width: 0;
}
</style>
