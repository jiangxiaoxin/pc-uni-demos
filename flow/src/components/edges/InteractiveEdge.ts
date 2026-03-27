/**
 * 交互式自定义边 - 选中时显示红色圆圈，点击圆圈触发事件
 * 
 * 实现要点：
 * - 重写 getAppendWidth() 方法（LogicFlow 推荐方式）
 * - 先调用 super.getAppendWidth() 获取原有选区
 * - 添加红色圆圈作为交互按钮
 */

import { PolylineEdge, PolylineEdgeModel, h } from '@logicflow/core';
import type { Point } from '@logicflow/core';

/**
 * Model 类 - 隐藏文本
 */
export class InteractiveEdgeModel extends PolylineEdgeModel {
  initEdgeData(data: any): void {
    super.initEdgeData(data);
    this.textMode = 'none';
  }
}

/**
 * View 类 - 选中时显示可点击的红色圆圈
 */
export class InteractiveEdgeView extends PolylineEdge {
  
  /**
   * 获取边的中点
   */
  private getCenter(points: Point[]): Point {
    if (points.length > 2) {
      const mid = Math.floor(points.length / 2);
      return {
        x: (points[mid - 1].x + points[mid].x) / 2,
        y: (points[mid - 1].y + points[mid].y) / 2,
      };
    }
    return {
      x: (points[0].x + points[points.length - 1].x) / 2,
      y: (points[0].y + points[points.length - 1].y) / 2,
    };
  }

  /**
   * 重写 getAppendWidth - 在选区中添加红色圆圈
   * 
   * LogicFlow 推荐通过此方法自定义边的选区和交互元素
   * 返回的内容会被包裹在 <g class="lf-edge-append"> 中
   */
  getAppendWidth(): any {
    const { model, graphModel } = this.props;
    
    // 获取父类的选区（透明点击区域）
    const baseAppend = super.getAppendWidth();
    
    // 未选中时只返回原有选区
    if (!model.isSelected) {
      return baseAppend;
    }
    
    const points = model.pointsList || [];
    if (points.length < 2) {
      return baseAppend;
    }
    
    const center = this.getCenter(points);
    const r = 10;
    
    // 点击处理器
    const onClick = (e: Event) => {
      e.stopPropagation();
      graphModel.eventCenter.emit('edge:circle-click', { 
        data: model.getData() 
      });
    };
    
    // 红色圆圈（交互按钮）
    const redCircle = h('g', {
      class: 'interactive-edge-button',
    }, [
      // 透明点击区域（比圆圈大，更容易点击）
      h('circle', {
        cx: center.x, 
        cy: center.y, 
        r: r + 5,
        fill: 'transparent', 
        cursor: 'pointer',
        onClick,
      }),
      // 可见的红色圆圈
      h('circle', {
        cx: center.x, 
        cy: center.y, 
        r,
        fill: '#ff4d4f', 
        stroke: '#fff', 
        'stroke-width': 2,
        style: { pointerEvents: 'none' },
      }),
    ]);
    
    // 合并原有选区和红圈
    // 注意：红圈放在后面，确保在 DOM 中位于上层
    if (baseAppend) {
      return h('g', {}, [baseAppend, redCircle]);
    }
    return redCircle;
  }
}

export const InteractiveEdge = {
  type: 'interactive-edge',
  view: InteractiveEdgeView,
  model: InteractiveEdgeModel,
};

export default InteractiveEdge;
