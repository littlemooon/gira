import { ColorProps } from 'ink'
import React, { ReactNode } from 'react'
import useCli from '../hooks/useCli'
import Column from './Column'
import LogText from './LogText'
import RenderTimes from './RenderTimes'
import Row from './Row'

export enum LogType {
  debug = 'debug',
  loading = 'loading',
  info = 'info',
  success = 'success',
  warn = 'warn',
  error = 'error',
}

const typeMaxLength = Math.max(...Object.values(LogType).map((x) => x.length))

function getTypeName(type: LogType) {
  return type.padEnd(typeMaxLength)
}

interface LogProps {
  type: LogType
  children: ReactNode
}

const logColorProps: Record<LogType, ColorProps> = {
  [LogType.debug]: { cyan: true },
  [LogType.loading]: { cyan: true },
  [LogType.info]: { blue: true },
  [LogType.success]: { green: true },
  [LogType.warn]: { yellow: true },
  [LogType.error]: { red: true },
}

export function getLogColorProps(type?: LogType) {
  return type ? logColorProps[type] : undefined
}

function LogBase({ type, children }: LogProps) {
  const { flags } = useCli()
  const colorProps = getLogColorProps(type)

  return (
    <Row gap={2}>
      {flags.debug ? (
        <Row gap={2}>
          <LogText.Default type={type} {...colorProps}>
            {getTypeName(type)}
          </LogText.Default>

          <LogText.Default>{Date.now()}</LogText.Default>
        </Row>
      ) : null}

      <Row>{children}</Row>
    </Row>
  )
}

const Log = {
  Debug({
    children,
    name,
    ...props
  }: Omit<LogProps, 'type'> & { name: string }) {
    const { flags } = useCli()
    return flags.debug ? (
      <RenderTimes count={1}>
        <LogBase type={LogType.debug} {...props}>
          <Column>
            <LogText.Default yellow>{name}</LogText.Default>
            {children}
          </Column>
        </LogBase>
      </RenderTimes>
    ) : null
  },
  Info(props: Omit<LogProps, 'type'>) {
    return <LogBase type={LogType.info} {...props} />
  },
  Success(props: Omit<LogProps, 'type'>) {
    return <LogBase type={LogType.success} {...props} />
  },
  Warn(props: Omit<LogProps, 'type'>) {
    return <LogBase type={LogType.warn} {...props} />
  },
  Error(props: Omit<LogProps, 'type'>) {
    return <LogBase type={LogType.error} {...props} />
  },
}

export default Log
