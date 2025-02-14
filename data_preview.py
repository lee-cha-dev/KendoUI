import pandas as pd


def main():
    data = pd.read_csv('data/customs_electricity_data.csv')
    print(data.columns)
    print(data.dtypes)
    for col in data.columns:
        print(col)


if __name__ == '__main__':
    main()
