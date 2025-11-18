// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import dateFns from 'date-fns';
import { BigNumber } from 'bignumber.js';

import rpc from '../../services/api';
import { formatNumber } from '../utils/format-number';
import { getCoinName } from '../utils/get-coin-name';

const ExplorerContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  padding: 20px;
  font-family: Chicago, Geneva, sans-serif;
`;

const Header = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 2px 2px 0 ${props => props.theme.colors.shadowColor};
`;

const Title = styled.h1`
  font-size: 24px;
  color: ${props => props.theme.colors.text};
  margin: 0 0 15px 0;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 10px;
  background: ${props => props.theme.colors.inputBg};
  border: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  font-family: Chicago, Geneva, sans-serif;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.theme.colors.buttonPrimaryBg};
  border: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  font-family: Chicago, Geneva, sans-serif;
  box-shadow: 2px 2px 0 ${props => props.theme.colors.shadowColor};

  &:hover {
    background: ${props => props.theme.colors.buttonPrimaryHover};
  }

  &:active {
    box-shadow: 1px 1px 0 ${props => props.theme.colors.shadowColor};
    transform: translate(1px, 1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ContentBox = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 2px 2px 0 ${props => props.theme.colors.shadowColor};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: ${props => props.theme.colors.text};
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dotted ${props => props.theme.colors.borderLight};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.backgroundDark}33;
  }
`;

const DataLabel = styled.span`
  font-weight: bold;
  color: ${props => props.theme.colors.text};
`;

const DataValue = styled.span`
  color: ${props => props.theme.colors.textLight};
  word-break: break-all;
  text-align: right;
  max-width: 60%;
`;

const ErrorMessage = styled.div`
  background: #FFF3CD;
  border: 2px solid #FFB800;
  padding: 15px;
  color: #856404;
  margin: 20px 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: ${props => props.theme.colors.text};
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.theme.colors.buttonPrimaryBg};
  border: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  font-family: Chicago, Geneva, sans-serif;
  margin-bottom: 20px;
  box-shadow: 2px 2px 0 ${props => props.theme.colors.shadowColor};

  &:hover {
    background: ${props => props.theme.colors.buttonPrimaryHover};
  }

  &:active {
    box-shadow: 1px 1px 0 ${props => props.theme.colors.shadowColor};
    transform: translate(1px, 1px);
  }
`;

const IOList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
`;

const IOItem = styled.div`
  padding: 8px;
  background: ${props => props.theme.colors.backgroundLight}44;
  border: 1px solid ${props => props.theme.colors.borderLight};
  margin-bottom: 5px;
  font-size: 12px;
`;

const ClickableAddress = styled.span`
  color: ${props => props.theme.colors.secondary};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${props => props.theme.colors.secondaryLight};
  }
`;

type Props = {
  history: Object,
  location: Object,
};

type State = {
  loading: boolean,
  error: ?string,
  searchQuery: string,
  viewType: 'home' | 'transaction' | 'block' | 'address',
  data: ?Object,
};

class ExplorerView extends Component<Props, State> {
  state = {
    loading: false,
    error: null,
    searchQuery: '',
    viewType: 'home',
    data: null,
  };

  componentDidMount() {
    // Check if there's a transaction ID in the query params
    const params = new URLSearchParams(this.props.location.search);
    const txid = params.get('txid');
    const blockHash = params.get('block');
    const address = params.get('address');

    if (txid) {
      this.searchTransaction(txid);
    } else if (blockHash) {
      this.searchBlock(blockHash);
    } else if (address) {
      this.searchAddress(address);
    }
  }

  handleSearch = async () => {
    const { searchQuery } = this.state;
    if (!searchQuery.trim()) return;

    this.setState({ loading: true, error: null });

    try {
      // Try to determine what type of search this is
      if (searchQuery.match(/^[0-9]+$/)) {
        // It's a block height
        await this.searchBlockByHeight(parseInt(searchQuery, 10));
      } else if (searchQuery.length === 64) {
        // Could be transaction or block hash
        try {
          await this.searchTransaction(searchQuery);
        } catch (e) {
          // If transaction fails, try as block hash
          await this.searchBlock(searchQuery);
        }
      } else if (searchQuery.startsWith('t') || searchQuery.startsWith('z')) {
        // It's an address
        await this.searchAddress(searchQuery);
      } else {
        this.setState({
          error: 'Invalid search query. Enter a transaction ID, block hash, block height, or address.',
          loading: false,
        });
      }
    } catch (error) {
      this.setState({
        error: error.message || 'Search failed. Please check your input.',
        loading: false,
      });
    }
  };

  searchTransaction = async (txid: string) => {
    this.setState({ loading: true, error: null });

    try {
      // First try getrawtransaction which works for all transactions
      const rawTx = await rpc.getrawtransaction(txid, 1);

      // Try to get wallet-specific info if available
      let walletTx = null;
      try {
        walletTx = await rpc.gettransaction(txid);
      } catch (e) {
        // Not a wallet transaction, that's fine
      }

      this.setState({
        viewType: 'transaction',
        data: { ...rawTx, ...walletTx },
        loading: false,
        error: null,
      });
    } catch (error) {
      this.setState({
        error: 'Transaction not found',
        loading: false,
      });
    }
  };

  searchBlock = async (blockHash: string) => {
    try {
      const block = await rpc.getblock(blockHash);

      this.setState({
        viewType: 'block',
        data: block,
        loading: false,
        error: null,
      });
    } catch (error) {
      throw new Error('Block not found');
    }
  };

  searchBlockByHeight = async (height: number) => {
    try {
      const blockHash = await rpc.getblockhash(height);
      await this.searchBlock(blockHash);
    } catch (error) {
      throw new Error('Block not found at this height');
    }
  };

  searchAddress = async (address: string) => {
    try {
      // For t-addresses
      if (address.startsWith('t')) {
        const unspent = await rpc.listunspent(0, 9999999, [address]);
        const received = await rpc.getreceivedbyaddress(address);

        this.setState({
          viewType: 'address',
          data: { address, unspent, received, type: 'transparent' },
          loading: false,
          error: null,
        });
      }
      // For z-addresses
      else if (address.startsWith('z')) {
        const balance = await rpc.z_getbalance(address);
        const received = await rpc.z_listreceivedbyaddress(address);

        this.setState({
          viewType: 'address',
          data: { address, balance, received, type: 'shielded' },
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      throw new Error('Address not found or invalid');
    }
  };

  handleBack = () => {
    this.props.history.goBack();
  };

  renderTransaction() {
    const { data } = this.state;
    if (!data) return null;

    const coinName = getCoinName();

    return (
      <div>
        <ContentBox>
          <SectionTitle>Transaction Details</SectionTitle>
          <DataRow>
            <DataLabel>Transaction ID:</DataLabel>
            <DataValue>{data.txid}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Confirmations:</DataLabel>
            <DataValue>{data.confirmations || 0}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Block Hash:</DataLabel>
            <DataValue>{data.blockhash || 'Unconfirmed'}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Block Height:</DataLabel>
            <DataValue>{data.height || 'Pending'}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Time:</DataLabel>
            <DataValue>
              {data.time ? dateFns.format(new Date(data.time * 1000), 'YYYY-MM-DD HH:mm:ss') : 'Pending'}
            </DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Amount:</DataLabel>
            <DataValue>
              {formatNumber({ value: Math.abs(data.amount || 0), maxDecimals: 8 })} {coinName}
            </DataValue>
          </DataRow>
          {data.fee && (
            <DataRow>
              <DataLabel>Fee:</DataLabel>
              <DataValue>
                {formatNumber({ value: Math.abs(data.fee), maxDecimals: 8 })} {coinName}
              </DataValue>
            </DataRow>
          )}
        </ContentBox>

        {data.vin && data.vin.length > 0 && (
          <ContentBox>
            <SectionTitle>Inputs ({data.vin.length})</SectionTitle>
            <IOList>
              {data.vin.map((input, idx) => (
                <IOItem key={idx}>
                  {input.coinbase ? (
                    <div>Coinbase (Newly Generated Coins)</div>
                  ) : (
                    <div>
                      <div>
                        TxID:{' '}
                        <ClickableAddress onClick={() => this.searchTransaction(input.txid)}>
                          {input.txid}
                        </ClickableAddress>
                      </div>
                      <div>Output: {input.vout}</div>
                    </div>
                  )}
                </IOItem>
              ))}
            </IOList>
          </ContentBox>
        )}

        {data.vout && data.vout.length > 0 && (
          <ContentBox>
            <SectionTitle>Outputs ({data.vout.length})</SectionTitle>
            <IOList>
              {data.vout.map((output, idx) => (
                <IOItem key={idx}>
                  <div>Value: {formatNumber({ value: output.value, maxDecimals: 8 })} {coinName}</div>
                  {output.scriptPubKey && output.scriptPubKey.addresses && (
                    <div>
                      Address:{' '}
                      {output.scriptPubKey.addresses.map((addr, addrIdx) => (
                        <span key={addrIdx}>
                          {addrIdx > 0 && ', '}
                          <ClickableAddress onClick={() => this.searchAddress(addr)}>
                            {addr}
                          </ClickableAddress>
                        </span>
                      ))}
                    </div>
                  )}
                </IOItem>
              ))}
            </IOList>
          </ContentBox>
        )}

        {((data.vjoinsplit && data.vjoinsplit.length > 0) ||
          (data.vShieldedSpend && data.vShieldedSpend.length > 0)) && (
          <ContentBox>
            <SectionTitle>🛡️ Shielded Transaction</SectionTitle>
            <DataRow>
              <DataLabel>Type:</DataLabel>
              <DataValue>This transaction contains shielded (private) components</DataValue>
            </DataRow>
          </ContentBox>
        )}
      </div>
    );
  }

  renderBlock() {
    const { data } = this.state;
    if (!data) return null;

    return (
      <div>
        <ContentBox>
          <SectionTitle>Block Information</SectionTitle>
          <DataRow>
            <DataLabel>Block Height:</DataLabel>
            <DataValue>{data.height}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Block Hash:</DataLabel>
            <DataValue>{data.hash}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Confirmations:</DataLabel>
            <DataValue>{data.confirmations}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Time:</DataLabel>
            <DataValue>
              {dateFns.format(new Date(data.time * 1000), 'YYYY-MM-DD HH:mm:ss')}
            </DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Transactions:</DataLabel>
            <DataValue>{data.tx ? data.tx.length : 0}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Difficulty:</DataLabel>
            <DataValue>{formatNumber({ value: data.difficulty, maxDecimals: 2 })}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Size:</DataLabel>
            <DataValue>{formatNumber({ value: data.size, maxDecimals: 0 })} bytes</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Previous Block:</DataLabel>
            <DataValue>{data.previousblockhash || 'Genesis Block'}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Next Block:</DataLabel>
            <DataValue>{data.nextblockhash || 'Latest Block'}</DataValue>
          </DataRow>
        </ContentBox>

        {data.tx && data.tx.length > 0 && (
          <ContentBox>
            <SectionTitle>Transactions in Block ({data.tx.length})</SectionTitle>
            <IOList>
              {data.tx.map((txid, idx) => (
                <IOItem key={idx}>
                  <div style={{ cursor: 'pointer' }} onClick={() => this.searchTransaction(txid)}>
                    {idx + 1}. {txid}
                  </div>
                </IOItem>
              ))}
            </IOList>
          </ContentBox>
        )}
      </div>
    );
  }

  renderAddress() {
    const { data } = this.state;
    if (!data) return null;

    const coinName = getCoinName();

    return (
      <div>
        <ContentBox>
          <SectionTitle>Address Information</SectionTitle>
          <DataRow>
            <DataLabel>Address:</DataLabel>
            <DataValue>{data.address}</DataValue>
          </DataRow>
          <DataRow>
            <DataLabel>Type:</DataLabel>
            <DataValue>{data.type === 'shielded' ? '🛡️ Shielded (z-address)' : 'Transparent (t-address)'}</DataValue>
          </DataRow>

          {data.type === 'transparent' && (
            <>
              <DataRow>
                <DataLabel>Total Received:</DataLabel>
                <DataValue>{formatNumber({ value: data.received, maxDecimals: 8 })} {coinName}</DataValue>
              </DataRow>
              <DataRow>
                <DataLabel>Unspent Outputs:</DataLabel>
                <DataValue>{data.unspent ? data.unspent.length : 0}</DataValue>
              </DataRow>
            </>
          )}

          {data.type === 'shielded' && (
            <>
              <DataRow>
                <DataLabel>Balance:</DataLabel>
                <DataValue>{formatNumber({ value: data.balance, maxDecimals: 8 })} {coinName}</DataValue>
              </DataRow>
              <DataRow>
                <DataLabel>Received Transactions:</DataLabel>
                <DataValue>{data.received ? data.received.length : 0}</DataValue>
              </DataRow>
            </>
          )}
        </ContentBox>
      </div>
    );
  }

  render() {
    const { loading, error, searchQuery, viewType } = this.state;

    return (
      <ExplorerContainer>
        <BackButton onClick={this.handleBack}>← Back</BackButton>

        <Header>
          <Title>🔍 Zipher Blockchain Explorer</Title>
          <p style={{ margin: '5px 0', color: '#666' }}>
            Search for transactions, blocks, or addresses
          </p>
          <SearchBar>
            <SearchInput
              type="text"
              placeholder="Enter transaction ID, block hash/height, or address..."
              value={searchQuery}
              onChange={(e) => this.setState({ searchQuery: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && this.handleSearch()}
            />
            <SearchButton onClick={this.handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </SearchButton>
          </SearchBar>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading && <LoadingMessage>Loading...</LoadingMessage>}

        {!loading && viewType === 'transaction' && this.renderTransaction()}
        {!loading && viewType === 'block' && this.renderBlock()}
        {!loading && viewType === 'address' && this.renderAddress()}

        {!loading && viewType === 'home' && !error && (
          <ContentBox>
            <SectionTitle>Welcome to Zipher Explorer</SectionTitle>
            <p style={{ marginBottom: '15px' }}>
              Use the search bar above to explore the ZClassic blockchain:
            </p>
            <ul style={{ lineHeight: '1.8' }}>
              <li><strong>Transaction ID:</strong> 64-character hex string</li>
              <li><strong>Block Hash:</strong> 64-character hex string</li>
              <li><strong>Block Height:</strong> Number (e.g., 1234567)</li>
              <li><strong>Address:</strong> Starts with 't' (transparent) or 'z' (shielded)</li>
            </ul>
          </ContentBox>
        )}
      </ExplorerContainer>
    );
  }
}

export const ExplorerViewComponent = withRouter(ExplorerView);
