import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../constants/color';
import { CategoryStatistics } from '../../../types/SpendingCategory.types';
import { translateDynamicText } from '../../../utils/translationHelpers';

interface CategoryPieChartProps {
  data: CategoryStatistics[];
}

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width - 80, 280);
const RADIUS = CHART_SIZE / 2;
const STROKE_WIDTH = 40;

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
  let currentAngle = -90; // Start from top

  const slices = data.map((item, index) => {
    const percentage = (item.totalAmount / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle = endAngle;

    // Calculate arc path
    const startX = RADIUS + RADIUS * Math.cos((startAngle * Math.PI) / 180);
    const startY = RADIUS + RADIUS * Math.sin((startAngle * Math.PI) / 180);
    const endX = RADIUS + RADIUS * Math.cos((endAngle * Math.PI) / 180);
    const endY = RADIUS + RADIUS * Math.sin((endAngle * Math.PI) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${RADIUS} ${RADIUS}`,
      `L ${startX} ${startY}`,
      `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      pathData,
      percentage,
      midAngle: startAngle + angle / 2,
    };
  });

  return (
    <View style={styles.container}>
      {/* SVG Pie Chart */}
      <View style={styles.chartContainer}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          <G>
            {slices.map((slice, index) => (
              <G key={slice.categoryId}>
                <Circle
                  cx={RADIUS}
                  cy={RADIUS}
                  r={RADIUS - STROKE_WIDTH / 2}
                  fill="none"
                  stroke={slice.categoryColor}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${
                    (slice.percentage / 100) *
                    2 *
                    Math.PI *
                    (RADIUS - STROKE_WIDTH / 2)
                  } ${2 * Math.PI * (RADIUS - STROKE_WIDTH / 2)}`}
                  strokeDashoffset={
                    (-slices
                      .slice(0, index)
                      .reduce((sum, s) => sum + s.percentage, 0) /
                      100) *
                    2 *
                    Math.PI *
                    (RADIUS - STROKE_WIDTH / 2)
                  }
                  rotation={-90}
                  origin={`${RADIUS}, ${RADIUS}`}
                />
              </G>
            ))}
          </G>

          {/* Center text */}
          <SvgText
            x={RADIUS}
            y={RADIUS - 10}
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill={Colors.gray}
          >
            {translateDynamicText('Tổng chi tiêu')}
          </SvgText>
          <SvgText
            x={RADIUS}
            y={RADIUS + 15}
            textAnchor="middle"
            fontSize="20"
            fontWeight="700"
            fill={Colors.text_dark}
          >
            {total.toLocaleString('vi-VN')}
          </SvgText>
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.slice(0, 5).map(item => (
          <View key={item.categoryId} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: item.categoryColor },
              ]}
            />
            <Ionicons
              name={item.categoryIcon as any}
              size={16}
              color={item.categoryColor}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.legendText} numberOfLines={1}>
              {translateDynamicText(item.categoryName)}
            </Text>
            <Text style={styles.legendPercentage}>
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
        {data.length > 5 && (
          <Text style={styles.moreText}>+{data.length - 5} danh mục khác</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: 24,
  },
  legendContainer: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text_dark,
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.main_bule,
  },
  moreText: {
    fontSize: 12,
    color: Colors.gray,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default CategoryPieChart;
