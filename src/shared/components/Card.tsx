import React, { memo } from 'react';
import { ViewProps } from 'react-native';
import { NeumorphicView } from './NeumorphicView';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = memo(({ children, style, ...props }: CardProps) => {
  return (
    <NeumorphicView
      style={style}
      {...props}
    >
      {children}
    </NeumorphicView>
  );
});

Card.displayName = 'Card';
