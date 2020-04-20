import React from 'react'
import BranchCommand from './commands/BranchCommand'
import CheckoutCommand from './commands/CheckoutCommand'
import CommitCommand from './commands/CommitCommand'
import IndexCommand from './commands/IndexCommand'
import StatusCommand from './commands/StatusCommand'
import ErrorBoundary from './components/ErrorBoundary'
import Router from './components/Router'
import { CliCommand } from './lib/cli'
import CliProvider from './providers/CliProvider'
import StaticProvider from './providers/StaticProvider'

export default function App() {
  return (
    <ErrorBoundary>
      <StaticProvider>
        <CliProvider>
          {(cli) => (
            <Router
              path={cli.command}
              config={{
                [CliCommand.INDEX]: <IndexCommand />,
                [CliCommand.STATUS]: <StatusCommand />,
                [CliCommand.BRANCH]: <BranchCommand />,
                [CliCommand.CHECKOUT]: <CheckoutCommand />,
                [CliCommand.COMMIT]: <CommitCommand />,
              }}
            />
          )}
        </CliProvider>
      </StaticProvider>
    </ErrorBoundary>
  )
}
