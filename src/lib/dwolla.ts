import { Client } from 'dwolla-v2';

const dwollaKey = process.env.DWOLLA_APP_KEY || '';
const dwollaSecret = process.env.DWOLLA_APP_SECRET || '';
const dwollaEnv = (process.env.DWOLLA_ENV as 'sandbox' | 'production') || 'sandbox';

// Initialize the Dwolla SDK Client if credentials are provided
const dwollaClient = dwollaKey && dwollaSecret 
  ? new Client({ key: dwollaKey, secret: dwollaSecret, environment: dwollaEnv })
  : null;

/**
 * Service to register a user as a Dwolla Customer.
 */
export async function createDwollaCustomer(
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
): Promise<string> {
  try {
    if (!dwollaClient) {
      console.warn('Dwolla credentials missing. Simulating Dwolla Customer Creation.');
      return `dwolla_cust_${userId}`;
    }

    const response = await dwollaClient.post('customers', {
      firstName,
      lastName,
      email,
      ipAddress: '127.0.0.1',
    });

    // Extract customer URL header location
    const customerUrl = response.headers.get('location') || '';
    return customerUrl;
  } catch (error) {
    console.error('Dwolla Customer Creation error:', error);
    throw new Error('Failed to create Dwolla Customer connection.');
  }
}

/**
 * Service to link a Plaid funding source to a Dwolla customer using a Plaid Processor Token.
 */
export async function linkPlaidFundingSource(
  dwollaCustomerUrl: string,
  plaidProcessorToken: string,
  accountName: string,
): Promise<string> {
  try {
    if (!dwollaClient) {
      console.warn('Dwolla credentials missing. Simulating Funding Source Linking.');
      return `${dwollaCustomerUrl}/funding-sources/fs_mock_${Math.random().toString(36).substring(7)}`;
    }

    const response = await dwollaClient.post(`${dwollaCustomerUrl}/funding-sources`, {
      plaidToken: plaidProcessorToken,
      name: accountName,
    });

    const fundingSourceUrl = response.headers.get('location') || '';
    return fundingSourceUrl;
  } catch (error) {
    console.error('Dwolla Funding Source Link error:', error);
    throw new Error('Failed to link funding source via Plaid.');
  }
}

/**
 * Service to initiate an ACH transfer between two funding sources.
 */
export async function initiateACHTransfer(
  sourceFundingSourceUrl: string,
  destinationFundingSourceUrl: string,
  amount: number,
): Promise<{ transferUrl: string; status: 'PENDING' | 'COMPLETED' | 'FAILED' }> {
  try {
    if (!dwollaClient) {
      console.warn('Dwolla credentials missing. Simulating ACH Transfer Initiation.');
      const mockId = `tx_mock_${Math.random().toString(36).substring(7)}`;
      return {
        transferUrl: `https://api.dwolla.com/transfers/${mockId}`,
        status: 'PENDING',
      };
    }

    const response = await dwollaClient.post('transfers', {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: 'USD',
        value: amount.toFixed(2),
      },
    });

    const transferUrl = response.headers.get('location') || '';
    return {
      transferUrl,
      status: 'PENDING', // Dwolla ACH transfers are initially pending clearance
    };
  } catch (error) {
    console.error('Dwolla ACH Transfer error:', error);
    throw new Error('Dwolla ACH Transfer processing failed.');
  }
}
