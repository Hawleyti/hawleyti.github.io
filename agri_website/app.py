from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 1. 数据库配置：创建一个名为 agriculture.db 的本地文件
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///agriculture.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 2. 定义数据模型（就像 Excel 的表头）
class Crop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)    # 作物名称
    category = db.Column(db.String(50))                 # 分类
    description = db.Column(db.Text)                    # 详细描述
    image_url = db.Column(db.String(200))               # 图片链接

# 3. 初始化数据库并添加一些测试数据
with app.app_context():
    db.create_all()
    # 如果数据库为空，则添加初始数据
    if Crop.query.count() == 0:
        sample_crops = [
            Crop(name="水稻", category="粮食", description="南方主要粮食...", image_url="https://lh3.googleusercontent.com/d/1T0lB6ckqFltBKW0alMyfyvVoDX4qIHXn?authuser=0"),
            Crop(name="小麦", category="粮食", description="北方主要粮食...", image_url="https://example.com/wheat.jpg"),
            Crop(name="砂糖橘", category="水果", description="冬季热销水果...", image_url="https://example.com/orange.jpg")
        ]
        db.session.bulk_save_objects(sample_crops)
        db.session.commit()

# 4. 强大的搜索接口
@app.route('/api/search', methods=['GET'])
def search():
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify([])

    # 使用数据库的 filter 功能进行模糊搜索 (LIKE 查询)
    # 这比 Python 列表循环快得多，能支撑万级数据
    results = Crop.query.filter(
        (Crop.name.contains(keyword)) | (Crop.description.contains(keyword))
    ).all()

    return jsonify([{
        "name": c.name,
        "category": c.category,
        "desc": c.description,
        "img": c.image_url
    } for c in results])

if __name__ == '__main__':
    app.run(debug=True)