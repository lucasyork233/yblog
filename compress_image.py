#!/usr/bin/env python3
"""
图片压缩脚本 - 通过缩小尺寸来减小文件大小
用法: python compress_image.py input.png [output.png] [max_width]
"""

from PIL import Image
import sys
import os


def compress_image(input_path, output_path=None, max_width=800):
    """
    压缩图片 - 缩小宽度到指定值，高度按比例缩放

    Args:
        input_path: 输入图片路径
        output_path: 输出图片路径（默认为 input_compressed.png）
        max_width: 最大宽度，默认800
    """
    if not os.path.exists(input_path):
        print(f"错误: 文件 '{input_path}' 不存在")
        return False

    if output_path is None:
        name, ext = os.path.splitext(input_path)
        output_path = f"{name}_compressed{ext}"

    try:
        # 获取原始文件大小
        original_size = os.path.getsize(input_path)

        # 打开图片
        img = Image.open(input_path)

        # 获取原始尺寸
        original_width, original_height = img.size
        print(f"原始尺寸: {original_width} x {original_height}")

        # 如果宽度大于 max_width，按比例缩小
        if original_width > max_width:
            # 计算新高度（保持宽高比）
            new_height = int(original_height * (max_width / original_width))
            img_resized = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            print(f"新尺寸: {max_width} x {new_height}")
        else:
            img_resized = img
            print(f"尺寸未改变（已小于 {max_width}px）")

        # 保存
        ext = output_path.lower().split('.')[-1]
        if ext == 'png':
            img_resized.save(output_path, optimize=True)
        else:
            if img_resized.mode in ('RGBA', 'P'):
                img_resized = img_resized.convert('RGB')
            img_resized.save(output_path, optimize=True, quality=85)

        # 获取压缩后文件大小
        compressed_size = os.path.getsize(output_path)

        # 计算压缩率
        reduction = (1 - compressed_size / original_size) * 100

        print(f"原始大小: {original_size / 1024:.1f} KB")
        print(f"压缩后: {compressed_size / 1024:.1f} KB")
        print(f"减小: {reduction:.1f}%")
        print(f"保存到: {output_path}")

        return True

    except Exception as e:
        print(f"错误: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n示例:")
        print("  python compress_image.py photo.png")
        print("  python compress_image.py photo.png output.png")
        print("  python compress_image.py photo.png output.png 1200  # 自定义宽度")
        return

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    max_width = int(sys.argv[3]) if len(sys.argv) > 3 else 800

    compress_image(input_path, output_path, max_width)


if __name__ == "__main__":
    main()
