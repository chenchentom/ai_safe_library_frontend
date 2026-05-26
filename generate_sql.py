import openpyxl

wb = openpyxl.load_workbook('/Volumes/mac/code/java/ai_safe_library_frontend/AI全链条热点技术栈.xlsx')
ws = wb.active

# 收集所有数据
data = []
first_row = True
for row in ws.iter_rows(values_only=True):
    if first_row:
        first_row = False
        continue
    if row[0]:  # 第一列有值的行才处理
        data.append(row)

print(f'共 {len(data)} 行数据')

# 构建层级结构
stages = {}  # 阶段名称 -> 阶段ID
sub_stages = {}  # (阶段名称, 子阶段名称) -> 子阶段ID
leaves = []  # 所有叶子节点

current_id = 1

sql_statements = []
sql_statements.append("-- 清空表数据")
sql_statements.append("DELETE FROM biz_supply_chain_tag;")
sql_statements.append("ALTER TABLE biz_supply_chain_tag AUTO_INCREMENT = 1;")
sql_statements.append("")
sql_statements.append("-- 插入数据")

# 第一遍：先插入所有阶段（level 1）
stage_names = []
for row in data:
    stage_name = row[0].strip() if row[0] else ''
    if stage_name and stage_name not in stage_names:
        stage_names.append(stage_name)

sort_order = 1
for stage_name in stage_names:
    stages[stage_name] = current_id
    sql = f"INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES ('{stage_name}', 0, 'stage', 1, 0, '/{current_id}', '{current_id}', {sort_order}, 1);"
    sql_statements.append(sql)
    current_id += 1
    sort_order += 1

# 第二遍：插入所有子阶段（level 2）
sub_stage_names = []
for row in data:
    stage_name = row[0].strip() if row[0] else ''
    sub_stage_name = row[1].strip() if row[1] else ''
    key = (stage_name, sub_stage_name)
    if stage_name and sub_stage_name and key not in sub_stage_names:
        sub_stage_names.append(key)

# 按阶段分组子阶段
sub_stages_by_stage = {}
for stage_name, sub_stage_name in sub_stage_names:
    if stage_name not in sub_stages_by_stage:
        sub_stages_by_stage[stage_name] = []
    sub_stages_by_stage[stage_name].append(sub_stage_name)

for stage_name in stage_names:
    if stage_name not in sub_stages_by_stage:
        continue
    sort_order = 1
    for sub_stage_name in sub_stages_by_stage[stage_name]:
        parent_id = stages[stage_name]
        sub_stages[(stage_name, sub_stage_name)] = current_id
        tag_path = f'/{parent_id}/{current_id}'
        ancestor_ids = f'{parent_id},{current_id}'
        sql = f"INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES ('{sub_stage_name}', {parent_id}, 'sub_stage', 2, 0, '{tag_path}', '{ancestor_ids}', {sort_order}, 1);"
        sql_statements.append(sql)
        current_id += 1
        sort_order += 1

# 第三遍：插入所有叶子节点（level 3）
leaves_by_sub_stage = {}
for row in data:
    stage_name = row[0].strip() if row[0] else ''
    sub_stage_name = row[1].strip() if row[1] else ''
    key = (stage_name, sub_stage_name)
    if key not in leaves_by_sub_stage:
        leaves_by_sub_stage[key] = []
    leaves_by_sub_stage[key].append(row)

for stage_name in stage_names:
    if stage_name not in sub_stages_by_stage:
        continue
    for sub_stage_name in sub_stages_by_stage[stage_name]:
        key = (stage_name, sub_stage_name)
        if key not in leaves_by_sub_stage:
            continue
        sort_order = 1
        for leaf_row in leaves_by_sub_stage[key]:
            leaf_name = leaf_row[2].strip() if leaf_row[2] else ''
            biz_type = leaf_row[3].strip() if leaf_row[3] else ''
            developer = leaf_row[4].strip() if leaf_row[4] else ''
            intro = leaf_row[5].strip() if leaf_row[5] else ''
            remark = leaf_row[6].strip() if leaf_row[6] else ''
            
            parent_id = sub_stages.get(key, 0)
            stage_id = stages.get(stage_name, 0)
            tag_path = f'/{stage_id}/{parent_id}/{current_id}'
            ancestor_ids = f'{stage_id},{parent_id},{current_id}'
            
            # 转义单引号
            leaf_name = leaf_name.replace("'", "\\'")
            biz_type = biz_type.replace("'", "\\'")
            developer = developer.replace("'", "\\'")
            intro = intro.replace("'", "\\'")
            remark = remark.replace("'", "\\'")
            
            sql = f"INSERT INTO `biz_supply_chain_tag` (`tag_name`, `parent_id`, `node_type`, `biz_type`, `developer`, `intro`, `remark`, `level`, `is_leaf`, `tag_path`, `ancestor_ids`, `sort_order`, `status`) VALUES ('{leaf_name}', {parent_id}, 'leaf', '{biz_type}', '{developer}', '{intro}', '{remark}', 3, 1, '{tag_path}', '{ancestor_ids}', {sort_order}, 1);"
            sql_statements.append(sql)
            current_id += 1
            sort_order += 1

# 写入SQL文件
with open('/Volumes/mac/code/java/ai_safe_library_frontend/full_init_supply_chain_tag.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print(f'生成完成！共 {len(sql_statements)} 条SQL语句')
print(f'文件路径: /Volumes/mac/code/java/ai_safe_library_frontend/full_init_supply_chain_tag.sql')
