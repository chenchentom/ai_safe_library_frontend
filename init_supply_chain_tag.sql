-- 创建供应链标签表
CREATE TABLE IF NOT EXISTS `biz_supply_chain_tag` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `tag_name` VARCHAR(100) NOT NULL COMMENT '节点名称（对应：阶段、子阶段、技术/工具名称）',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父节点ID（0表示顶级阶段）',
  `node_type` VARCHAR(50) NOT NULL COMMENT '节点类型（枚举：stage 阶段, sub_stage 子阶段, leaf 具体技术）',
  `biz_type` VARCHAR(50) NULL COMMENT '业务形态（如：开源软件、商业平台、开源方法等）',
  `developer` VARCHAR(100) NULL COMMENT '归属方/开发团队（如：NVIDIA, unstructured-io社区）',
  `intro` VARCHAR(500) NULL COMMENT '核心能力一句话介绍',
  `remark` VARCHAR(1000) NULL COMMENT '补充说明信息',
  `level` INT NOT NULL COMMENT '层级深度（1:阶段, 2:子阶段, 3:技术）',
  `is_leaf` TINYINT(1) DEFAULT 0 COMMENT '是否为叶子节点（1是，0否。只有叶子节点上述4个新增字段才有值）',
  `tag_path` VARCHAR(255) NOT NULL COMMENT '路径枚举（格式：/父ID/自身ID/，用于极速树形查询）',
  `ancestor_ids` VARCHAR(255) NOT NULL COMMENT '祖先ID集合（格式：1,5，方便快速判断和路径回溯）',
  `sort_order` INT DEFAULT 0 COMMENT '同级展示排序权重',
  `ext_info` TEXT NULL COMMENT '扩展信息字段，应对未来特化属性',
  `status` TINYINT(1) DEFAULT 1 COMMENT '状态（1正常，0禁用）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_by` VARCHAR(64) DEFAULT '' COMMENT '创建者',
  `update_by` VARCHAR(64) DEFAULT '' COMMENT '更新者',
  `del_flag` CHAR(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  PRIMARY KEY (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_node_type` (`node_type`),
  KEY `idx_level` (`level`),
  KEY `idx_tag_path` (`tag_path`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='供应链标签表';

-- 插入示例数据
-- 阶段1: AI开发
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('AI开发', 0, 'stage', 1, 0, '/1', '1', 1, 1);

-- 子阶段
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('Agent', 1, 'sub_stage', 2, 0, '/1/2', '1,2', 1, 1),
('向量数据库', 1, 'sub_stage', 2, 0, '/1/3', '1,3', 2, 1),
('模型微调', 1, 'sub_stage', 2, 0, '/1/4', '1,4', 3, 1);

-- 叶子节点 - Agent
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('LangChain', 2, 'leaf', '开源软件', 'LangChain社区', '用于构建基于语言模型的应用程序的框架', 3, 1, '/1/2/5', '1,2,5', 1, 1),
('LlamaIndex', 2, 'leaf', '开源软件', 'LlamaIndex社区', '数据框架，用于将LLM与私有数据连接', 3, 1, '/1/2/6', '1,2,6', 2, 1),
('AutoGPT', 2, 'leaf', '开源软件', 'AutoGPT社区', '自主GPT代理，能够自主执行任务', 3, 1, '/1/2/7', '1,2,7', 3, 1);

-- 叶子节点 - 向量数据库
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('Chroma', 3, 'leaf', '开源软件', 'Chroma社区', '用于AI应用的开源向量数据库', 3, 1, '/1/3/8', '1,3,8', 1, 1),
('Pinecone', 3, 'leaf', '商业平台', 'Pinecone公司', '完全托管的云原生向量数据库服务', 3, 1, '/1/3/9', '1,3,9', 2, 1),
('Milvus', 3, 'leaf', '开源软件', 'Zilliz', '云原生向量数据库，专为向量相似度搜索和AI应用而构建', 3, 1, '/1/3/10', '1,3,10', 3, 1),
('Weaviate', 3, 'leaf', '开源软件', 'Weaviate社区', '开源向量搜索引擎，支持语义搜索', 3, 1, '/1/3/11', '1,3,11', 4, 1);

-- 叶子节点 - 模型微调
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('LoRA', 4, 'leaf', '开源方法', 'Microsoft', '低秩适应，高效的大语言模型微调方法', 3, 1, '/1/4/12', '1,4,12', 1, 1),
('QLoRA', 4, 'leaf', '开源方法', 'UC Berkeley', '量化LoRA，进一步降低微调成本', 3, 1, '/1/4/13', '1,4,13', 2, 1);

-- 阶段2: 数据采集
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('数据采集', 0, 'stage', 1, 0, '/14', '14', 2, 1);

-- 子阶段 - 数据采集
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('网页爬虫', 14, 'sub_stage', 2, 0, '/14/15', '14,15', 1, 1),
('文档解析', 14, 'sub_stage', 2, 0, '/14/16', '14,16', 2, 1);

-- 叶子节点 - 网页爬虫
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('Crawl4AI', 15, 'leaf', '开源软件', 'Crawl4AI社区', '专为AI设计的网页爬虫，支持JavaScript渲染', 3, 1, '/14/15/17', '14,15,17', 1, 1),
('Firecrawl', 15, 'leaf', '商业平台', 'Firecrawl公司', '将网站转换为LLM友好格式的API服务', 3, 1, '/14/15/18', '14,15,18', 2, 1),
('Scrapy', 15, 'leaf', '开源软件', 'Scrapy社区', 'Python快速高级网页抓取和网页爬取框架', 3, 1, '/14/15/19', '14,15,19', 3, 1);

-- 叶子节点 - 文档解析
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('Unstructured', 16, 'leaf', '开源软件', 'Unstructured-io社区', '将非结构化文档转换为结构化数据的开源工具', 3, 1, '/14/16/20', '14,16,20', 1, 1),
('LangChain Document Loaders', 16, 'leaf', '开源软件', 'LangChain社区', 'LangChain提供的多种文档加载器', 3, 1, '/14/16/21', '14,16,21', 2, 1);

-- 阶段3: 模型推理
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('模型推理', 0, 'stage', 1, 0, '/22', '22', 3, 1);

-- 子阶段 - 模型推理
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('推理引擎', 22, 'sub_stage', 2, 0, '/22/23', '22,23', 1, 1),
('API服务', 22, 'sub_stage', 2, 0, '/22/24', '22,24', 2, 1);

-- 叶子节点 - 推理引擎
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('vLLM', 23, 'leaf', '开源软件', 'UC Berkeley', '高吞吐量和低延迟的LLM推理和服务引擎', 3, 1, '/22/23/25', '22,23,25', 1, 1),
('TensorRT-LLM', 23, 'leaf', '开源软件', 'NVIDIA', 'NVIDIA用于LLM推理的GPU加速库', 3, 1, '/22/23/26', '22,23,26', 2, 1),
('Ollama', 23, 'leaf', '开源软件', 'Ollama社区', '本地运行大语言模型的简便工具', 3, 1, '/22/23/27', '22,23,27', 3, 1);

-- 叶子节点 - API服务
INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES 
('OpenAI API', 24, 'leaf', '商业平台', 'OpenAI', 'GPT系列模型的官方API服务', 3, 1, '/22/24/28', '22,24,28', 1, 1),
('Anthropic Claude API', 24, 'leaf', '商业平台', 'Anthropic', 'Claude系列模型的官方API服务', 3, 1, '/22/24/29', '22,24,29', 2, 1),
('Together AI', 24, 'leaf', '商业平台', 'Together AI', '提供多种开源模型的推理API服务', 3, 1, '/22/24/30', '22,24,30', 3, 1);
