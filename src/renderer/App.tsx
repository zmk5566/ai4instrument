import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Grommet,
  Anchor,
  Header,
  Tabs,
  Page,
  Tab,
  grommet,
  Box,
  PageContent,
  Text,
  List,
  Button,
} from 'grommet';
import React, { useContext, useState } from 'react';
import { deepMerge } from 'grommet/utils';
import {
  Moon,
  Sun,
  Analytics,
  Chat,
  Clock,
  Configure,
  Help,
  Projects,
  Split,
  StatusInfoSmall,
} from 'grommet-icons';
import { contextBridge, ipcRenderer } from 'electron';
import { json } from 'stream/consumers';
// get electronHandler defined in the preload script

window.electron.ipcRenderer.on('ipc-haha', (event, args) => {
  console.log('ipc-haha', args);
  // if (args[0] == 'pong') {
  console.log('pong received');
  // }
});

function AppBar(props) {
  return (
    <Header
      background="light-3"
      align="center"
      justify="center"
      pad="medium"
      height="xsmall"
    >
      <Anchor icon={<Split color="brand" />} label="AI4Instruments" />
    </Header>
  );
}

function TabBar() {
  return (
    <Box align="center" pad="medium">
      <Tabs>
        <Tab title="Status" icon={<Clock />}>
          <Box fill pad="medium" justify="center" round="small">
            <Status />
          </Box>
        </Tab>

        <Tab title="Training" icon={<Projects />}>
          <Box margin="small">Billing Information</Box>
        </Tab>

        <Tab title="Settings" icon={<Configure />}>
          <Box margin="small">Account Information</Box>
        </Tab>
      </Tabs>
    </Box>
  );
}

const theme = deepMerge(grommet, {});



const status_values = [
  { name: 'OSC Server Status', info: 'Not Running' },
  { name: 'Trained', info: 'false' },
  { name: 'ML Running', info: 'false' },
  { name: 'osc_inbound_port', info: '8000' },
  { name: 'osc_outbound_port', info: '8500' },
];

function Status() {
  return (
    <Box align="center" pad="large">
      <List data={status_values} primaryKey="name" secondaryKey="info" />
    </Box>
  );
}

function updateStatus() {
  console.log('updateStatus');

  var temp_data = {"name":"ssss", "info":"ssss","data":[1,2,3,4,5,6,7,8,9,10]};
  window.electron.ipcRenderer.sendMessage('ipc-example', [JSON.stringify(temp_data)]);
  //window.electron.ipcRenderer.sendMessage('ipc-example', temp_data);

  //window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
}

function Hello() {
  const [dark, setDark] = useState(false);

  return (
    <Grommet theme={theme} full themeMode={dark ? 'dark' : 'light'}>
      <AppBar />
      <TabBar />
      <Button onClick={updateStatus}> UPDATE</Button>
      <Page>
        <PageContent />
      </Page>
    </Grommet>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
