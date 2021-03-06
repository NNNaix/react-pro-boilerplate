import { resolve } from 'path';
import { argv } from 'yargs';
import merge from 'webpack-merge';
import SpeedMeasurePlugin from 'speed-measure-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// import CompressionPlugin from 'compression-webpack-plugin';
// import CopyPlugin from 'copy-webpack-plugin';
import SizePlugin from 'size-plugin';

import { boostrapDevServer } from '@scripts/utils/boostrapDevServer';
import { SettingSection } from '@server/infra/setting/setting.constants';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { HashedModuleIdsPlugin } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { generateCommonConfig } from './webpack.common';

export async function generateProdConfig() {
    const { settingService } = await boostrapDevServer();
    const serverSectionSetting = settingService.get(SettingSection.SERVER);
    const mergedConfig = merge(generateCommonConfig(serverSectionSetting), {
        mode: 'production',
        devtool: 'cheap-source-map',
        optimization: {
            minimize: true,
            runtimeChunk: 'single',
            nodeEnv: 'production',
            minimizer: [
                /** minify js */
                new TerserPlugin({ extractComments: false }),
                /** optimize & minify css */
                new OptimizeCssAssetsPlugin({}),
            ],
            // splitChunks: {
            //     chunks: 'all',
            //     minChunks: 1,
            //     cacheGroups: {
            //         moment: {
            //             test: /[/\\]node_modules[/\\]moment[/\\].*[jt]sx?$/,
            //             chunks: 'initial',
            //             priority: 20,
            //             enforce: true,
            //         },
            //         react: {
            //             test: /[/\\]node_modules[/\\]react[/\\].*[jt]sx?$/,
            //             chunks: 'initial',
            //             priority: 50,
            //             enforce: true,
            //         },
            //         vendors: {
            //             test: /[/\\]node_modules[/\\].*[jt]sx?$/,
            //             chunks: 'initial',
            //             priority: -10,
            //             reuseExistingChunk: true,
            //             enforce: true,
            //         },
            //         default: {
            //             priority: -20,
            //             chunks: 'all',
            //             test: /.*[jt]sx?$/,
            //             reuseExistingChunk: true,
            //         },
            //     },
            // },
        },
        plugins: [
            new HashedModuleIdsPlugin(),
            new ForkTsCheckerWebpackPlugin({
                // 生产环境打包并不频繁，可以适当调高允许使用的内存，加快类型检查速度
                memoryLimit: 1024 * 2,
                tsconfig: resolve(
                    serverSectionSetting.runtime.appRootPath,
                    './client/app/tsconfig.json',
                ),
                measureCompilationTime: true,
                checkSyntacticErrors: true,
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].[contenthash].css',
                chunkFilename: 'css/[id].[contenthash].css',
                ignoreOrder: false,
            }),

            // new CompressionPlugin({ cache: true }),
            // new CopyPlugin([
            //     {
            //         context: resolve(rootPath, './public'),
            //         from: '*',
            //         to: resolve(rootPath, './build'),
            //         toType: 'dir',
            //         ignore: ['index.html'],
            //     },
            //     {
            //         context: resolve(rootPath, './server'),
            //         from: '*',
            //         to: resolve(rootPath, './build/server'),
            //         toType: 'dir',
            //     },
            // ]),
        ],
    });

    // eslint-disable-next-line import/no-mutable-exports
    let prodConfig = mergedConfig;

    if (argv.analyze) {
        // 使用 --analyze 参数构建时，会输出各个阶段的耗时和自动打开浏览器访问 bundle 分析页面
        prodConfig.plugins!.push(new SizePlugin({ writeFile: false }), new BundleAnalyzerPlugin());
        const smp = new SpeedMeasurePlugin();
        prodConfig = smp.wrap(mergedConfig);
    }

    return prodConfig;
}
