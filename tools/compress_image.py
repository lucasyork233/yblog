import os
import sys
from PIL import Image


def compress_image(image_name='demo.png'):
    """
    压缩图片
    image_name: 待压缩图片名称，手动填写，放同级目录
    return:     res.png 压缩后长度为 800
    """
    res_image_name = 'res.png'
    new_width = max_width = 800

    try:
        # 打开图片
        img = Image.open(image_name)
    except FileNotFoundError:
        print(f'Error: 没有找到待压缩图片“{image_name}”')
        return

    # 获取原始尺寸
    original_width, original_height = img.size
    print(f'原尺寸: {original_width} x {original_height}')
    if original_width < max_width:
        print(f'尺寸已小于 {max_width}px')
        return

    # 计算
    new_height = int(original_height * new_width / original_width)
    print(f'新尺寸: {new_width} x {new_height}')
    print('=' * 50, flush=True)
    img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # 保存
    img_resized.save(res_image_name, optimize=True, quality=85)

    # 总结
    # 获取压缩前后文件大小
    original_size = os.path.getsize(image_name)
    compressed_size = os.path.getsize(res_image_name)
    # 计算压缩率
    reduction = (1 - compressed_size / original_size) * 100
    print(f'原始大小: {original_size / 1024:.2f} KB')
    print(f'结果大小: {compressed_size / 1024:.2f} KB')
    print(f'压缩比例: {reduction:.2f}%')
    print(f'保存名称: {res_image_name}')


if __name__ == '__main__':
    compress_image()
