'use client';

import { Box, Text, Title } from '@mantine/core';
import classes from './SectionTitle.module.css';

interface SectionTitleProps {
  overline: string;
  title: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  light?: boolean;
}

export function SectionTitle({
  overline,
  title,
  align = 'left',
  light = false
}: SectionTitleProps) {
  return (
    <Box className={classes.wrapper} style={{ textAlign: align }}>
      <Text
        className={classes.overline}
        style={{ color: light ? 'var(--mg-pink)' : 'var(--mg-gray)' }}
      >
        {overline}
      </Text>
      <Title
        order={2}
        className={classes.title}
        style={{ color: light ? 'var(--mg-white)' : 'var(--mg-dark)' }}
      >
        {title}
      </Title>
    </Box>
  );
}
