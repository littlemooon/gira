import React, { ReactNode, useCallback, useMemo, useState } from 'react'
import Command from '../components/Command'
import Exit from '../components/Exit'
import GitRouter from '../components/GitRouter'
import Select, { SelectItem } from '../components/Select'
import useCli from '../hooks/useCli'
import useGitQuery from '../hooks/useGitQuery'
import { filterArray } from '../lib/array'
import { CliCommandKey, cliCommands, exposedCliCommands } from '../lib/command'
import { queries } from '../lib/queries'
import { getMaxLength, join } from '../lib/string'
import { useExit } from './ExitProvider'

export default function CommandSelectProvider({
  keys,
  children,
}: {
  children?: ReactNode
  keys?: CliCommandKey[]
}) {
  const { flags } = useCli()
  const branchQuery = useGitQuery(queries.branch, undefined)
  const statusQuery = useGitQuery(queries.status, undefined)

  const { exit } = useExit()
  const [command, setCommand] = useState<CliCommandKey | undefined>()

  const handleSelect = useCallback(
    (item: SelectItem) => {
      if (item.id === 'exit') {
        exit()
      } else {
        setCommand(item.id as CliCommandKey)
      }
    },
    [setCommand, exit]
  )

  const onFeature = branchQuery.state?.onFeature

  const items: SelectItem[] = useMemo(() => {
    const selected = keys
      ? Object.values(cliCommands).filter((x) => keys.includes(x.key))
      : exposedCliCommands

    const exposed = keys
      ? exposedCliCommands.filter((x) => !keys?.includes(x.key))
      : []

    const commands = [...selected, ...exposed].filter((x) => {
      return [
        x.require?.feature ? onFeature : true,
        x.require?.staged ? statusQuery.state?.hasStagedChanges : true,
        x.require?.working ? statusQuery.state?.hasWorkingChanges : true,
        x.require?.ahead ? statusQuery.state?.ahead : true,
      ].every(Boolean)
    })

    const maxLength = getMaxLength(commands.map((x) => x.key))
    return filterArray(
      commands.map((command) => ({
        label: join(
          [
            command.key.padEnd(command.shortcut ? maxLength : maxLength + 3),
            command.description,
          ],
          '    '
        ),
        id: command.key,
        shortcut: command.shortcut,
        bold: keys?.includes(command.key),
      }))
    )
  }, [keys, onFeature, statusQuery.state])

  return flags.exit ? (
    <Exit reason="commandselect" />
  ) : (
    <GitRouter response={branchQuery}>
      <GitRouter response={statusQuery}>
        {command ? (
          <Command command={cliCommands[command]}>
            {children ?? <CommandSelectProvider />}
          </Command>
        ) : (
          <Select
            title="Commands"
            onSelect={handleSelect}
            items={[...items, { id: 'exit', label: 'exit', shortcut: 'x' }]}
          />
        )}
      </GitRouter>
    </GitRouter>
  )
}
